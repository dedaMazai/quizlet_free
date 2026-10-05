-- Главная (экран 6.1): прогноз повторений, долг по колодам, «Пропуски» по колодам, цель дня.
-- Выполнять вручную в Supabase SQL Editor ПОСЛЕ srs.sql и statistics.sql. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.


-- ============================================================================
-- 1. Настройки пользователя (цель дня; дальше сюда же onboarding_done, тема и т.п.)
-- ============================================================================

create table if not exists public.user_preferences (
  user_id    uuid primary key default auth.uid() references auth.users on delete cascade,
  daily_goal smallint not null default 20 check (daily_goal between 1 and 500),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "read own preferences" on public.user_preferences;
create policy "read own preferences" on public.user_preferences
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "insert own preferences" on public.user_preferences;
create policy "insert own preferences" on public.user_preferences
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "update own preferences" on public.user_preferences;
create policy "update own preferences" on public.user_preferences
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ============================================================================
-- 2. get_due_summary: прогноз на p_days дней + долг и новые слова по колодам
-- ============================================================================
-- День 0 включает всё просроченное — это и есть «к повторению сегодня».
-- Дни — в часовом поясе пользователя (p_tz); пустые дни отдаются с нулём.
-- per_deck.due совпадает с get_due_count (due_at <= now()), per_deck.new — карточки
-- без строки в card_reviews (get_mastery их не видит).
-- SECURITY INVOKER (по умолчанию): RLS на cards и card_reviews отрабатывает сама.
create or replace function public.get_due_summary(p_tz text, p_days int default 7)
returns jsonb
language sql
stable
as $$
  with today as (
    select (now() at time zone p_tz)::date as td
  ),
  days as (
    select (td + g)::date as d
    from today, generate_series(0, p_days - 1) g
  ),
  due as (
    select greatest((cr.due_at at time zone p_tz)::date, td) as d
    from public.card_reviews cr, today
    where cr.user_id = auth.uid()
      and (cr.due_at at time zone p_tz)::date < td + p_days
  ),
  per_deck as (
    select c.deck_id,
           count(*) filter (where cr.card_id is not null and cr.due_at <= now())::int as due,
           count(*) filter (where cr.card_id is null)::int as new
    from public.cards c
    left join public.card_reviews cr on cr.card_id = c.id and cr.user_id = auth.uid()
    group by c.deck_id
  )
  select jsonb_build_object(
    'forecast', (
      select coalesce(jsonb_agg(jsonb_build_object(
          'date', days.d,
          'count', (select count(*) from due where due.d = days.d)
        ) order by days.d), '[]'::jsonb)
      from days
    ),
    'per_deck', (
      select coalesce(jsonb_agg(jsonb_build_object(
          'deck_id', deck_id, 'due', due, 'new', new
        )), '[]'::jsonb)
      from per_deck
    )
  );
$$;


-- ============================================================================
-- 3. get_cloze_stats: колоды с примерами и дата последней сессии «Пропуски»
-- ============================================================================
-- Для «Следующего шага» (BACKLOG §7, правило 2): колода с фразами и примерами,
-- давно без «Пропусков». Только колоды, где есть хотя бы один пример.
create or replace function public.get_cloze_stats()
returns jsonb
language sql
stable
as $$
  with examples as (
    select c.deck_id, count(*)::int as examples_count
    from public.cards c
    where c.example is not null and btrim(c.example) <> ''
    group by c.deck_id
  ),
  last_cloze as (
    select deck_key, max(created_at) as last_cloze_at
    from public.study_events
    where user_id = auth.uid() and mode = 'cloze'
    group by deck_key
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'deck_id', e.deck_id,
      'examples_count', e.examples_count,
      'last_cloze_at', lc.last_cloze_at
    )), '[]'::jsonb)
  from examples e
  left join last_cloze lc on lc.deck_key = e.deck_id::text;
$$;

grant execute on function public.get_due_summary(text, int) to authenticated;
grant execute on function public.get_cloze_stats() to authenticated;
