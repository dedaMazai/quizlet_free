-- Аккаунт (итерация 10): часовой пояс, защита админских полей профиля, статистика пользователя для админа.
-- Выполнять вручную в Supabase SQL Editor ПОСЛЕ roles.sql, block.sql, ai.sql (user_timezone). Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.

-- 1. Часовой пояс пользователя (IANA). null — не выбран (сервер считает Europe/Moscow).
alter table public.profiles add column if not exists timezone text;

-- 2. Защита полей, которые меняет только админ: лимит ИИ и блокировка.
-- RLS «update own profile» пропускает всю строку — без триггера пользователь мог бы
-- поднять себе ai_limit или снять блокировку прямым update profiles.
create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Как и protect_profile_role: в SQL Editor / под service_role auth.uid() = null — менять можно.
  if auth.uid() is not null and not public.is_admin() then
    new.ai_limit := old.ai_limit;
    new.blocked := old.blocked;
    new.blocked_at := old.blocked_at;
    new.blocked_by := old.blocked_by;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_admin_fields_trg on public.profiles;
create trigger protect_profile_admin_fields_trg
  before update on public.profiles
  for each row execute function public.protect_profile_admin_fields();

-- 3. admin_user_stats — колоды, слова и текущая серия пользователя (панель на вкладке «Пользователи»).
-- Серия считается по дням в часовом поясе пользователя (как get_study_overview).
create or replace function public.admin_user_stats(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tz text;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;

  v_tz := public.user_timezone(p_user_id);

  return (
    with days as (
      select distinct (created_at at time zone v_tz)::date as d
      from public.study_events
      where user_id = p_user_id
    ),
    -- gap-and-islands: подряд идущие даты дают одинаковый island.
    streaks as (
      select count(*) as len, max(d) as last_day
      from (select d, d - (row_number() over (order by d))::int as island from days) g
      group by island
    )
    select jsonb_build_object(
      'decks', (select count(*) from public.decks where user_id = p_user_id),
      'words', (
        select count(*) from public.cards c
        join public.decks dk on dk.id = c.deck_id
        where dk.user_id = p_user_id
      ),
      'streak', coalesce((
        select len from streaks
        where last_day >= (now() at time zone v_tz)::date - 1
        order by last_day desc
        limit 1
      ), 0)
    )
  );
end;
$$;

grant execute on function public.admin_user_stats(uuid) to authenticated;
