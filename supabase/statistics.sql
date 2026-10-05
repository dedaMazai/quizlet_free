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
  mode         text not null,            -- 'choice' | 'write_ru_en' | 'write_en_ru' | 'cloze' | 'order' | 'flashcards' (просмотр, не ответ)
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
-- 2.1–2.3 get_study_overview, get_study_heatmap, get_deck_progress ПЕРЕЕХАЛИ в user_progress.sql
-- (необязательный p_user_id для экрана /users/:id). Определения удалены отсюда, иначе повторный
-- прогон создал бы вторые перегрузки и вызовы стали бы неоднозначными.

-- 2.4 get_mastery считается по card_reviews — сейчас тоже в user_progress.sql.

