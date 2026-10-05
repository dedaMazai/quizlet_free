-- Учёт использования ИИ-проверки переводов и серверный лимит запросов на пользователя.
-- Выполнять вручную в Supabase SQL Editor. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.
-- Лимит дневной: счётчик обнуляется в полночь по часовому поясу пользователя
-- (profiles.timezone, без него — Europe/Moscow). usage_date только растёт: смена пояса
-- «назад» не обнуляет счётчик, так что переключением поясов лимит не обойти.

-- 1. ai_usage — счётчик запросов к ИИ по пользователям за день usage_date.
create table if not exists public.ai_usage (
  user_id uuid primary key references auth.users on delete cascade,
  count int not null default 0,
  updated_at timestamptz not null default now()
);

-- Строки бессрочного счётчика получают usage_date = null и обнуляются при первом запросе.
alter table public.ai_usage add column if not exists usage_date date;

alter table public.ai_usage enable row level security;

-- Пользователь видит только свою строку. Прямой insert/update запрещён —
-- счётчик меняется только через SECURITY DEFINER-функции ниже.
drop policy if exists "read own ai usage" on public.ai_usage;
create policy "read own ai usage" on public.ai_usage
  for select to authenticated using (user_id = auth.uid());

-- 1a. Персональный дневной лимит запросов к ИИ. По умолчанию 5, верхней границы нет (0 = ИИ отключён).
alter table public.profiles add column if not exists ai_limit int not null default 5;
alter table public.profiles drop constraint if exists profiles_ai_limit_check;
alter table public.profiles add constraint profiles_ai_limit_check check (ai_limit >= 0);

-- 1b. Часовой пояс пользователя (IANA, напр. 'Europe/Moscow'); правится в профиле, см. account.sql.
alter table public.profiles add column if not exists timezone text;

-- 1c. user_timezone — пояс пользователя; неизвестное Postgres значение → Europe/Moscow.
-- profiles.timezone пишет сам пользователь, поэтому мусор не должен ронять `at time zone`.
create or replace function public.user_timezone(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.timezone from public.profiles p
     join pg_catalog.pg_timezone_names z on z.name = p.timezone
     where p.id = p_user_id),
    'Europe/Moscow'
  );
$$;

-- 1d. ai_today — текущий день пользователя для дневного лимита.
create or replace function public.ai_today(p_user_id uuid)
returns date
language sql
stable
security definer
set search_path = public
as $$
  select (now() at time zone public.user_timezone(p_user_id))::date;
$$;

-- 2. consume_ai_credit — атомарно резервирует один запрос к ИИ из дневного лимита.
-- Бросает AI_LIMIT_EXCEEDED при достижении лимита. Возвращает остаток после списания.
-- Лимит берётся из profiles.ai_limit текущего пользователя (p_limit — фолбэк).
-- Админ (is_admin) не упирается в лимит и не расходует счётчик. См. supabase/roles.sql.
create or replace function public.consume_ai_credit(p_limit int default 5)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  cur int;
  v_day date;
  v_limit int;
  v_today date := public.ai_today(auth.uid());
begin
  if public.is_admin() then
    return 9999;
  end if;

  select coalesce(ai_limit, p_limit) into v_limit from public.profiles where id = auth.uid();
  v_limit := coalesce(v_limit, p_limit);

  insert into public.ai_usage (user_id, count, usage_date)
  values (auth.uid(), 0, v_today)
  on conflict (user_id) do nothing;

  select count, usage_date into cur, v_day from public.ai_usage where user_id = auth.uid() for update;

  -- Новый день — считаем с нуля. Дата «из будущего» (пояс сменили назад) счётчик не сбрасывает.
  if v_day is null or v_day < v_today then
    cur := 0;
    v_day := v_today;
  end if;

  if cur >= v_limit then
    raise exception 'AI_LIMIT_EXCEEDED';
  end if;

  update public.ai_usage
  set count = cur + 1, usage_date = v_day, updated_at = now()
  where user_id = auth.uid();

  return v_limit - (cur + 1);
end;
$$;

-- 3. refund_ai_credit — откат одного запроса (при ошибке вызова OpenAI).
create or replace function public.refund_ai_credit()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ai_usage
  set count = greatest(count - 1, 0), updated_at = now()
  where user_id = auth.uid()
    and usage_date >= public.ai_today(auth.uid());
end;
$$;

-- 4. get_ai_usage — остаток доступных на сегодня запросов для показа в UI.
-- Лимит берётся из profiles.ai_limit текущего пользователя (p_limit — фолбэк).
create or replace function public.get_ai_usage(p_limit int default 5)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  cur int;
  v_limit int;
begin
  if public.is_admin() then
    return 9999;
  end if;

  select coalesce(ai_limit, p_limit) into v_limit from public.profiles where id = auth.uid();
  v_limit := coalesce(v_limit, p_limit);

  select count into cur from public.ai_usage
  where user_id = auth.uid() and usage_date >= public.ai_today(auth.uid());
  return v_limit - coalesce(cur, 0);
end;
$$;

-- 5. set_user_ai_limit — админ выставляет персональный дневной лимит запросов к ИИ пользователю.
create or replace function public.set_user_ai_limit(p_user_id uuid, p_limit int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  if p_limit < 0 then
    raise exception 'INVALID_LIMIT';
  end if;
  update public.profiles set ai_limit = p_limit where id = p_user_id;
end;
$$;

-- 6. admin_get_ai_usage — израсходовано сегодня по всем пользователям (таблица «Пользователи»).
-- Возвращает [{ user_id, used }] только для тех, кто сегодня обращался к ИИ.
create or replace function public.admin_get_ai_usage()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object('user_id', u.user_id, 'used', u.count)), '[]'::jsonb)
    from public.ai_usage u
    where u.usage_date >= public.ai_today(u.user_id)
  );
end;
$$;
