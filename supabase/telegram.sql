-- Telegram Mini App: привязка Telegram-аккаунта к пользователю Zubrika.
-- Выполнять вручную в Supabase SQL Editor. Зависимостей от других скриптов нет. Скрипт идемпотентный.
-- Выполнить ДО деплоя фронта с Telegram-входом.
-- Пишет в таблицу только Edge Function `telegram-auth` (service role) — после проверки подписи initData.


-- ============================================================================
-- 1. telegram_accounts: один Telegram-аккаунт ↔ один пользователь
-- ============================================================================

create table if not exists public.telegram_accounts (
  telegram_id bigint primary key,
  user_id     uuid not null unique references auth.users on delete cascade,
  username    text,
  created_at  timestamptz not null default now()
);

alter table public.telegram_accounts enable row level security;

-- Только чтение своей привязки (строка «Telegram привязан» в настройках).
-- Insert/update/delete политик нет — их делает service role, который RLS обходит.
drop policy if exists "read own telegram account" on public.telegram_accounts;
create policy "read own telegram account" on public.telegram_accounts
  for select to authenticated using (user_id = auth.uid());
