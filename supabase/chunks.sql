-- Карточки-фразы (чанки): тип карточки и связь сгенерированных коллокаций с исходным словом.
-- Выполнять вручную в Supabase SQL Editor. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.

-- 1. card_type — 'word' (одно слово) | 'phrase' (коллокация, чанк).
alter table public.cards add column if not exists card_type text not null default 'word';
alter table public.cards drop constraint if exists cards_card_type_check;
alter table public.cards add constraint cards_card_type_check
  check (card_type in ('word', 'phrase'));

-- Разовый бэкфилл: многословный term считаем фразой.
-- Гард: выполняется, только пока в базе нет ни одной фразы — повторный запуск
-- не отменит ручные правки пользователя.
do $$
begin
  if not exists (select 1 from public.cards where card_type = 'phrase') then
    update public.cards set card_type = 'phrase' where term ~ '\s';
  end if;
end $$;

-- 2. parent_card_id — исходное слово, из которого сгенерирован чанк.
-- on delete set null (не cascade): удаление слова не должно молча стирать
-- фразы, которые пользователь уже учит.
alter table public.cards add column if not exists parent_card_id uuid
  references public.cards(id) on delete set null;
create index if not exists cards_parent_idx on public.cards (parent_card_id);

-- RLS не трогаем: политики cards (owner-only + can_edit_deck_cards из shared_edit.sql)
-- распространяются на новые колонки автоматически.
