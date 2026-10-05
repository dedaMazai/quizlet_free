-- Прогресс (экран 6.23): показатели KPI-полосы за период и за такой же период до него.
-- Выполнять вручную в Supabase SQL Editor ПОСЛЕ statistics.sql. Скрипт идемпотентный.
-- ВАЖНО: выполнить ДО деплоя фронта — клиент пишет study_events.session_id,
-- без колонки вставка ответов падает.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.


-- ============================================================================
-- 1. study_events.session_id — один запуск режима (новый id и при «Заново»)
-- ============================================================================
-- Ответы до появления колонки остаются с null — для них сессии считаются по перерывам.
alter table public.study_events add column if not exists session_id uuid;


-- ============================================================================
-- 2. get_progress_summary: ответы, верные, время и сессии за p_days дней
-- ============================================================================
-- current — последние p_days дней включая сегодня, previous — p_days дней перед ними.
-- Дни — в часовом поясе пользователя (p_tz).
-- Сессии: различные session_id + для старых ответов без session_id — серии ответов
-- без перерыва дольше 30 минут. Сессия с session_id на границе периодов попадёт в оба.
-- SECURITY INVOKER (по умолчанию): RLS на study_events отрабатывает сама.
create or replace function public.get_progress_summary(p_tz text, p_days int default 365)
returns jsonb
language sql
stable
as $$
  with today as (
    select (now() at time zone p_tz)::date as td
  ),
  ev as (
    select e.is_correct, e.duration_ms, e.created_at, e.session_id,
           case when (e.created_at at time zone p_tz)::date > td - p_days
                then 'current' else 'previous' end as period,
           lag(e.created_at) over (
             partition by e.session_id is null order by e.created_at
           ) as prev_at
    from public.study_events e, today
    where e.user_id = auth.uid()
      and (e.created_at at time zone p_tz)::date > td - 2 * p_days
  )
  select jsonb_object_agg(period, stats)
  from (
    select p.period, jsonb_build_object(
      'total_answers', count(ev.created_at),
      'correct_answers', count(ev.created_at) filter (where ev.is_correct),
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

grant execute on function public.get_progress_summary(text, int) to authenticated;
