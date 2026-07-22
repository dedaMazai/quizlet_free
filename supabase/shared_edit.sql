-- Общее редактирование колод + права админа на расшаренные колоды.
-- Скрипт идемпотентный, миграций нет — выполнять целиком в Supabase SQL Editor.
-- Применять ПОСЛЕ sharing.sql и roles.sql (использует is_deck_shared_with_me, owns_deck, is_admin).

-- 1. Настройка владельца «могут редактировать все, у кого есть доступ».
alter table public.decks add column if not exists allow_shared_edit boolean not null default false;

-- 2. Кто может править карточки колоды: владелец, гость при allow_shared_edit, админ-гость.
-- SECURITY DEFINER — иначе рекурсия политик decks <-> cards (см. комментарий в sharing.sql).
create or replace function public.can_edit_deck_cards(p_deck_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.owns_deck(p_deck_id)
      or (public.is_deck_shared_with_me(p_deck_id)
          and (public.is_admin()
               or exists (
                 select 1 from public.decks d
                 where d.id = p_deck_id and d.allow_shared_edit
               )));
$$;

-- 3. Дополнительные политики записи cards. Permissive-политики объединяются через OR
-- с существующими owner-only, поэтому старые не трогаем.
drop policy if exists "insert cards in editable decks" on public.cards;
create policy "insert cards in editable decks" on public.cards
  for insert to authenticated
  with check (user_id = auth.uid() and public.can_edit_deck_cards(deck_id));

-- update без проверки user_id: гость правит карточку владельца, владелец строки не меняется.
drop policy if exists "update cards in editable decks" on public.cards;
create policy "update cards in editable decks" on public.cards
  for update to authenticated
  using (public.can_edit_deck_cards(deck_id))
  with check (public.can_edit_deck_cards(deck_id));

drop policy if exists "delete cards in editable decks" on public.cards;
create policy "delete cards in editable decks" on public.cards
  for delete to authenticated
  using (public.can_edit_deck_cards(deck_id));

-- 4. Админ может править саму колоду (имя/описание), если она с ним расшарена.
-- Удаление колоды и управление доступом остаются только у владельца.
drop policy if exists "admin can update shared decks" on public.decks;
create policy "admin can update shared decks" on public.decks
  for update to authenticated
  using (public.is_admin() and public.is_deck_shared_with_me(id))
  with check (public.is_admin() and public.is_deck_shared_with_me(id));
