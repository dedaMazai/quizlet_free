-- Учёт использования ИИ-проверки переводов и серверный лимит запросов на пользователя.
-- Выполнять вручную в Supabase SQL Editor. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.

-- 1. ai_usage — счётчик запросов к ИИ по пользователям.
create table if not exists public.ai_usage (
  user_id uuid primary key references auth.users on delete cascade,
  count int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

-- Пользователь видит только свою строку. Прямой insert/update запрещён —
-- счётчик меняется только через SECURITY DEFINER-функции ниже.
drop policy if exists "read own ai usage" on public.ai_usage;
create policy "read own ai usage" on public.ai_usage
  for select to authenticated using (user_id = auth.uid());

-- 1a. Персональный лимит запросов к ИИ. По умолчанию 5, диапазон 0..25 (0 = ИИ отключён).
alter table public.profiles add column if not exists ai_limit int not null default 5;
alter table public.profiles drop constraint if exists profiles_ai_limit_check;
alter table public.profiles add constraint profiles_ai_limit_check check (ai_limit between 0 and 25);

-- 2. consume_ai_credit — атомарно резервирует один запрос к ИИ.
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
  v_limit int;
begin
  if public.is_admin() then
    return 9999;
  end if;

  select coalesce(ai_limit, p_limit) into v_limit from public.profiles where id = auth.uid();
  v_limit := coalesce(v_limit, p_limit);

  insert into public.ai_usage (user_id, count)
  values (auth.uid(), 0)
  on conflict (user_id) do nothing;

  select count into cur from public.ai_usage where user_id = auth.uid() for update;

  if cur >= v_limit then
    raise exception 'AI_LIMIT_EXCEEDED';
  end if;

  update public.ai_usage
  set count = count + 1, updated_at = now()
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
  where user_id = auth.uid();
end;
$$;

-- 4. get_ai_usage — остаток доступных запросов для показа в UI.
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

  select count into cur from public.ai_usage where user_id = auth.uid();
  return v_limit - coalesce(cur, 0);
end;
$$;

-- 5. set_user_ai_limit — админ выставляет персональный лимит запросов к ИИ пользователю.
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
  if p_limit < 0 or p_limit > 25 then
    raise exception 'INVALID_LIMIT';
  end if;
  update public.profiles set ai_limit = p_limit where id = p_user_id;
end;
$$;
