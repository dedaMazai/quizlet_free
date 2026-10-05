-- Онбординг (итерация 15, BACKLOG §5): флаг «онбординг пройден или пропущен».
-- Выполнять вручную в Supabase SQL Editor ПОСЛЕ home.sql (таблица user_preferences). Скрипт идемпотентный.
-- Выполнить в проде ДО деплоя фронта: клиент выбирает onboarding_done вместе с daily_goal.
--
-- Вместе с ним перезапустить statistics.sql и progress.sql (оба идемпотентные): первая сессия
-- онбординга пишет просмотры «Карточек» (study_events.mode = 'flashcards'), и RPC статистики
-- считают их в серию, тепловую карту и время, но не в ответы и точность.

alter table public.user_preferences
  add column if not exists onboarding_done boolean not null default false;
