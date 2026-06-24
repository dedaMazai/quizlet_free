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

-- 2. consume_ai_credit — атомарно резервирует один запрос к ИИ.
-- Бросает AI_LIMIT_EXCEEDED при достижении лимита. Возвращает остаток после списания.
-- Админ (is_admin) не упирается в лимит и не расходует счётчик. См. supabase/roles.sql.
create or replace function public.consume_ai_credit(p_limit int default 5)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  cur int;
begin
  if public.is_admin() then
    return 9999;
  end if;

  insert into public.ai_usage (user_id, count)
  values (auth.uid(), 0)
  on conflict (user_id) do nothing;

  select count into cur from public.ai_usage where user_id = auth.uid() for update;

  if cur >= p_limit then
    raise exception 'AI_LIMIT_EXCEEDED';
  end if;

  update public.ai_usage
  set count = count + 1, updated_at = now()
  where user_id = auth.uid();

  return p_limit - (cur + 1);
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
create or replace function public.get_ai_usage(p_limit int default 5)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  cur int;
begin
  if public.is_admin() then
    return 9999;
  end if;

  select count into cur from public.ai_usage where user_id = auth.uid();
  return p_limit - coalesce(cur, 0);
end;
$$;
