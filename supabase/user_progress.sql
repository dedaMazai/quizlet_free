-- Статистика «Прогресса» для себя и (админу) для другого пользователя: экран /users/:id.
-- Выполнять вручную в Supabase SQL Editor ПОСЛЕ statistics.sql, progress.sql, srs.sql, roles.sql.
-- Скрипт идемпотентный. Выполнить ДО деплоя фронта: клиент передаёт p_user_id.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.
--
-- Пять функций ПЕРЕЕХАЛИ сюда из statistics.sql (get_study_overview, get_study_heatmap,
-- get_deck_progress), progress.sql (get_progress_summary) и srs.sql (get_mastery):
-- у них появился необязательный p_user_id. Там определения удалены, иначе повторный
-- прогон тех скриптов создал бы вторую перегрузку и вызовы стали бы неоднозначными.
--
-- p_user_id = null (или свой id) — статистика текущего пользователя, как раньше.
-- Чужой id — только админу (вкладка «Пользователи» доступна только ему).
-- Функции SECURITY DEFINER: RLS на study_events/card_reviews пускает только к своим
-- строкам, поэтому доступ проверяет stats_user_id, а фильтр по user_id — явный.


-- ============================================================================
-- 1. Чью статистику считаем
-- ============================================================================
create or replace function public.stats_user_id(p_user_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_user_id is null or p_user_id = auth.uid() then
    return auth.uid();
  end if;
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  return p_user_id;
end;
$$;


-- ============================================================================
-- 2. Старые сигнатуры (без p_user_id)
-- ============================================================================
drop function if exists public.get_study_overview(text);
drop function if exists public.get_study_heatmap(text, int);
drop function if exists public.get_deck_progress(text);
drop function if exists public.get_progress_summary(text, int);
drop function if exists public.get_mastery();


-- ============================================================================
-- 3. Сводка: точность, время, серии (streak)
-- ============================================================================
-- Правило текущей серии: «жива», если занимался сегодня ИЛИ вчера (GitHub-стиль).
create or replace function public.get_study_overview(p_tz text, p_user_id uuid default null)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  -- is_answer = false — просмотр в «Карточках» (первая сессия онбординга): идёт в серию и время,
  -- но не в ответы и точность
  with u as (
    select public.stats_user_id(p_user_id) as id
  ),
  ev as (
    select is_correct, duration_ms, mode <> 'flashcards' as is_answer,
           (created_at at time zone p_tz)::date as d
    from public.study_events, u
    where user_id = u.id
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
    'total_answers', (select count(*) from ev where is_answer),
    'correct_answers', (select count(*) filter (where is_correct) from ev where is_answer),
    'accuracy', (select case when count(*) = 0 then null
                        else round(count(*) filter (where is_correct)::numeric / count(*), 4) end
                 from ev where is_answer),
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


-- ============================================================================
-- 4. Тепловая карта активности: { date, count } только по активным дням (≤ p_days)
-- ============================================================================
create or replace function public.get_study_heatmap(
  p_tz text, p_days int default 365, p_user_id uuid default null
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object('date', d, 'count', cnt) order by d), '[]'::jsonb)
  from (
    select (created_at at time zone p_tz)::date as d, count(*) as cnt
    from public.study_events
    where user_id = public.stats_user_id(p_user_id)
      and created_at >= now() - (p_days || ' days')::interval
    group by 1
  ) t;
$$;


-- ============================================================================
-- 5. Точность по колодам (с последним снапшотом имени — переживает удаление колоды)
-- ============================================================================
-- Просмотры в «Карточках» (mode = 'flashcards') — не ответы, в точность не входят.
create or replace function public.get_deck_progress(p_tz text default 'UTC', p_user_id uuid default null)
returns jsonb
language sql
stable
security definer
set search_path = public
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
    where user_id = public.stats_user_id(p_user_id)
      and mode <> 'flashcards'
    group by deck_key
  ) t;
$$;


-- ============================================================================
-- 6. KPI за период и за такой же период до него (экран 6.23)
-- ============================================================================
-- current — последние p_days дней включая сегодня, previous — p_days дней перед ними.
-- Сессии: различные session_id + для старых ответов без session_id — серии ответов
-- без перерыва дольше 30 минут. Сессия с session_id на границе периодов попадёт в оба.
create or replace function public.get_progress_summary(
  p_tz text, p_days int default 365, p_user_id uuid default null
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with today as (
    select (now() at time zone p_tz)::date as td
  ),
  ev as (
    -- is_answer = false — просмотр в «Карточках»: идёт во время и сессии, но не в ответы
    select e.is_correct, e.duration_ms, e.created_at, e.session_id, e.mode <> 'flashcards' as is_answer,
           case when (e.created_at at time zone p_tz)::date > td - p_days
                then 'current' else 'previous' end as period,
           lag(e.created_at) over (
             partition by e.session_id is null order by e.created_at
           ) as prev_at
    from public.study_events e, today
    where e.user_id = public.stats_user_id(p_user_id)
      and (e.created_at at time zone p_tz)::date > td - 2 * p_days
  )
  select jsonb_object_agg(period, stats)
  from (
    select p.period, jsonb_build_object(
      'total_answers', count(ev.created_at) filter (where ev.is_answer),
      'correct_answers', count(ev.created_at) filter (where ev.is_answer and ev.is_correct),
      'total_duration_ms', coalesce(sum(ev.duration_ms), 0),
      'sessions', count(distinct ev.session_id) + count(ev.created_at) filter (
        where ev.session_id is null
          and (ev.prev_at is null or ev.created_at - ev.prev_at > interval '30 minutes')
      )
    ) as stats
    from (values ('current'), ('previous')) p(period)
    left join ev on ev.period = p.period
    group by p.period
  ) s;
$$;


-- ============================================================================
-- 7. Освоенность по card_reviews (+ имя колоды: чужие колоды клиенту не видны)
-- ============================================================================
create or replace function public.get_mastery(p_user_id uuid default null)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with per_deck as (
    select c.deck_id::text as deck_key,
           max(dk.name) as deck_name,
           count(*) filter (where cr.level = 0) as new,
           count(*) filter (where cr.level = 1) as learning,
           count(*) filter (where cr.level = 2) as mastered
    from public.card_reviews cr
    join public.cards c on c.id = cr.card_id
    join public.decks dk on dk.id = c.deck_id
    where cr.user_id = public.stats_user_id(p_user_id)
    group by c.deck_id
  )
  select jsonb_build_object(
    'overall', jsonb_build_object(
      'new',      coalesce(sum(new), 0),
      'learning', coalesce(sum(learning), 0),
      'mastered', coalesce(sum(mastered), 0)
    ),
    'per_deck', coalesce(jsonb_agg(jsonb_build_object(
        'deck_key', deck_key, 'deck_name', deck_name,
        'new', new, 'learning', learning, 'mastered', mastered
      )), '[]'::jsonb)
  )
  from per_deck;
$$;


grant execute on function public.stats_user_id(uuid) to authenticated;
grant execute on function public.get_study_overview(text, uuid) to authenticated;
grant execute on function public.get_study_heatmap(text, int, uuid) to authenticated;
grant execute on function public.get_deck_progress(text, uuid) to authenticated;
grant execute on function public.get_progress_summary(text, int, uuid) to authenticated;
grant execute on function public.get_mastery(uuid) to authenticated;
