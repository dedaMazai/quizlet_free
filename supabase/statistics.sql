-- Личная статистика заучивания.
-- Выполнять вручную в Supabase SQL Editor. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.

-- 1. study_events — append-only журнал ответов (источник правды для статистики).
create table if not exists public.study_events (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users on delete cascade,
  card_id      uuid references public.cards(id) on delete set null, -- карточку могут удалить
  deck_key     text not null,            -- deck_uuid ИЛИ '__favorites__' / '__all_words__'
  deck_name    text,                     -- снапшот имени колоды на момент ответа
  is_correct   boolean not null,
  level_before smallint not null,        -- 0|1|2
  level_after  smallint not null,        -- 0|1|2
  mode         text not null,            -- 'choice' | 'write'
  duration_ms  integer,                  -- время на ответ (nullable)
  created_at   timestamptz not null default now()
);

create index if not exists study_events_user_created_idx on public.study_events (user_id, created_at desc);
create index if not exists study_events_user_deck_idx    on public.study_events (user_id, deck_key);

alter table public.study_events enable row level security;

drop policy if exists "read own study events" on public.study_events;
create policy "read own study events" on public.study_events
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "insert own study events" on public.study_events;
create policy "insert own study events" on public.study_events
  for insert to authenticated with check (user_id = auth.uid());
-- update/delete не разрешены: лог append-only.

-- 2. RPC-агрегации.
-- Все функции SECURITY INVOKER (по умолчанию) — RLS изолирует данные по auth.uid().
-- Группировка по дню — в часовом поясе пользователя (p_tz); created_at хранится в UTC.

-- 2.1 Сводка: точность, время, серии (streak).
-- Правило текущей серии: «жива», если занимался сегодня ИЛИ вчера (GitHub-стиль).
create or replace function public.get_study_overview(p_tz text)
returns jsonb
language sql
stable
as $$
  with ev as (
    select is_correct, duration_ms,
           (created_at at time zone p_tz)::date as d
    from public.study_events
    where user_id = auth.uid()
  ),
  days as (
    select distinct d from ev
  ),
  -- gap-and-islands: подряд идущие даты дают одинаковый island.
  grp as (
    select d, d - (row_number() over (order by d))::int as island
    from days
  ),
  streaks as (
    select count(*) as len, max(d) as last_day
    from grp
    group by island
  ),
  today as (
    select (now() at time zone p_tz)::date as td
  )
  select jsonb_build_object(
    'total_answers', (select count(*) from ev),
    'correct_answers', (select count(*) filter (where is_correct) from ev),
    'accuracy', (select case when count(*) = 0 then null
                        else round(count(*) filter (where is_correct)::numeric / count(*), 4) end from ev),
    'total_duration_ms', (select coalesce(sum(duration_ms), 0) from ev),
    'current_streak', coalesce((
        select len from streaks, today
        where last_day >= td - 1
        order by last_day desc
        limit 1
    ), 0),
    'longest_streak', coalesce((select max(len) from streaks), 0)
  );
$$;

-- 2.2 Тепловая карта активности: { date, count } только по активным дням (≤ p_days).
create or replace function public.get_study_heatmap(p_tz text, p_days int default 365)
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_agg(jsonb_build_object('date', d, 'count', cnt) order by d), '[]'::jsonb)
  from (
    select (created_at at time zone p_tz)::date as d, count(*) as cnt
    from public.study_events
    where user_id = auth.uid()
      and created_at >= now() - (p_days || ' days')::interval
    group by 1
  ) t;
$$;

-- 2.3 Точность по колодам (с последним снапшотом имени — переживает удаление колоды).
create or replace function public.get_deck_progress(p_tz text default 'UTC')
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'deck_key', deck_key,
      'deck_name', deck_name,
      'total_answers', total_answers,
      'correct_answers', correct_answers,
      'accuracy', accuracy
    ) order by total_answers desc), '[]'::jsonb)
  from (
    select deck_key,
           (array_agg(deck_name order by created_at desc) filter (where deck_name is not null))[1] as deck_name,
           count(*) as total_answers,
           count(*) filter (where is_correct) as correct_answers,
           round(count(*) filter (where is_correct)::numeric / count(*), 4) as accuracy
    from public.study_events
    where user_id = auth.uid()
    group by deck_key
  ) t;
$$;

-- 2.4 Освоенность из learn_progress.levels. Синтетические колоды (__*) исключены из overall
-- (иначе одни и те же карточки считались бы дважды), но остаются отдельными в per_deck.
create or replace function public.get_mastery()
returns jsonb
language sql
stable
as $$
  with lvl as (
    select lp.deck_key, (kv.value)::int as level
    from public.learn_progress lp
    cross join lateral jsonb_each_text(lp.levels) as kv(card_id, value)
    where lp.user_id = auth.uid()
  ),
  per_deck as (
    select deck_key,
           count(*) filter (where level = 0) as new,
           count(*) filter (where level = 1) as learning,
           count(*) filter (where level = 2) as mastered
    from lvl
    group by deck_key
  )
  select jsonb_build_object(
    'overall', jsonb_build_object(
      'new',      coalesce(sum(new)      filter (where left(deck_key, 2) <> '__'), 0),
      'learning', coalesce(sum(learning) filter (where left(deck_key, 2) <> '__'), 0),
      'mastered', coalesce(sum(mastered) filter (where left(deck_key, 2) <> '__'), 0)
    ),
    'per_deck', coalesce(jsonb_agg(jsonb_build_object(
        'deck_key', deck_key, 'new', new, 'learning', learning, 'mastered', mastered
      )), '[]'::jsonb)
  )
  from per_deck;
$$;

grant execute on function public.get_study_overview(text) to authenticated;
grant execute on function public.get_study_heatmap(text, int) to authenticated;
grant execute on function public.get_deck_progress(text) to authenticated;
grant execute on function public.get_mastery() to authenticated;
