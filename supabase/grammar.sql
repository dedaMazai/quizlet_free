-- Грамматика (экраны 6.18–6.20): результаты практики времён и освоенность по времени.
-- Выполнять вручную в Supabase SQL Editor. Зависимостей от других скриптов нет. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.


-- ============================================================================
-- 1. grammar_results: ответ на одно задание практики (append-only)
-- ============================================================================
-- tense_id — id времени из src/shared/const/grammar/tenses.ts ('present-perfect' и т.п.).
-- Пишется только первая проверка набора; повтор «Только ошибки» не пишется.

create table if not exists public.grammar_results (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  tense_id   text not null check (tense_id ~ '^[a-z-]{3,40}$'),
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists grammar_results_user_tense_idx
  on public.grammar_results (user_id, tense_id, created_at desc, id desc);

alter table public.grammar_results enable row level security;

drop policy if exists "read own grammar results" on public.grammar_results;
create policy "read own grammar results" on public.grammar_results
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "insert own grammar results" on public.grammar_results;
create policy "insert own grammar results" on public.grammar_results
  for insert to authenticated with check (user_id = auth.uid());


-- ============================================================================
-- 2. get_tense_mastery: верных ответов среди последних p_window по каждому времени
-- ============================================================================
-- Освоенность времени = число делений в матрице (0–p_window). Времена без ответов не отдаются.
-- SECURITY INVOKER (по умолчанию): RLS на grammar_results отрабатывает сама.
create or replace function public.get_tense_mastery(p_window int default 5)
returns jsonb
language sql
stable
as $$
  with ranked as (
    select tense_id, is_correct,
           row_number() over (partition by tense_id order by created_at desc, id desc) as rn
    from public.grammar_results
    where user_id = auth.uid()
  )
  select coalesce(jsonb_agg(jsonb_build_object(
      'tense_id', tense_id,
      'score', score
    ) order by tense_id), '[]'::jsonb)
  from (
    select tense_id, count(*) filter (where is_correct)::int as score
    from ranked
    where rn <= p_window
    group by tense_id
  ) s;
$$;

grant execute on function public.get_tense_mastery(int) to authenticated;
