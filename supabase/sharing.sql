-- Шаринг колод между пользователями.
-- Выполнять вручную в Supabase SQL Editor. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.

-- 1. profiles — зеркало auth.users для поиска по email и показа автора колоды.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  name text
);

alter table public.profiles enable row level security;

drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated" on public.profiles
  for select to authenticated using (true);

-- Триггер: заполнять profiles при регистрации.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name')
  on conflict (id) do update set email = excluded.email, name = excluded.name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Бэкфилл существующих пользователей.
insert into public.profiles (id, email, name)
select id, email, raw_user_meta_data->>'name'
from auth.users
on conflict (id) do nothing;

-- FK для встраивания profiles в выборку decks (PostgREST embed).
alter table public.decks drop constraint if exists decks_owner_profile_fkey;
alter table public.decks
  add constraint decks_owner_profile_fkey
  foreign key (user_id) references public.profiles(id);

-- 2. deck_shares — кому открыт доступ к колоде.
create table if not exists public.deck_shares (
  deck_id uuid not null references public.decks on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (deck_id, user_id)
);

-- FK на profiles для встраивания профиля в выборку deck_shares (PostgREST embed).
alter table public.deck_shares drop constraint if exists deck_shares_user_profile_fkey;
alter table public.deck_shares
  add constraint deck_shares_user_profile_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.deck_shares enable row level security;

-- SECURITY DEFINER-функции обходят RLS и разрывают взаимную рекурсию политик
-- decks <-> deck_shares (иначе ошибка 42P17 "infinite recursion detected in policy").
create or replace function public.is_deck_shared_with_me(p_deck_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.deck_shares
    where deck_id = p_deck_id and user_id = auth.uid()
  );
$$;

create or replace function public.owns_deck(p_deck_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.decks
    where id = p_deck_id and user_id = auth.uid()
  );
$$;

-- Видеть строку доступа может её получатель ИЛИ владелец колоды.
drop policy if exists "read own or owned deck shares" on public.deck_shares;
create policy "read own or owned deck shares" on public.deck_shares
  for select to authenticated
  using (user_id = auth.uid() or public.owns_deck(deck_id));

-- Удалить доступ может его получатель («убрать из своих») ИЛИ владелец колоды (отозвать).
drop policy if exists "delete own or owned deck shares" on public.deck_shares;
create policy "delete own or owned deck shares" on public.deck_shares
  for delete to authenticated
  using (user_id = auth.uid() or public.owns_deck(deck_id));

-- INSERT напрямую запрещён — только через RPC share_deck_by_email ниже.

-- 3. RPC: поделиться колодой по email.
create or replace function public.share_deck_by_email(p_deck_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if not exists (select 1 from public.decks where id = p_deck_id and user_id = auth.uid()) then
    raise exception 'NOT_OWNER';
  end if;

  select id into target_id from public.profiles where email = lower(p_email);
  if target_id is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  if target_id = auth.uid() then
    raise exception 'CANNOT_SHARE_WITH_SELF';
  end if;

  insert into public.deck_shares (deck_id, user_id)
  values (p_deck_id, target_id)
  on conflict do nothing;
end;
$$;

-- 4. RLS decks: видеть колоду может владелец ИЛИ тот, кому открыт доступ.
drop policy if exists "read own or shared decks" on public.decks;
create policy "read own or shared decks" on public.decks
  for select to authenticated
  using (user_id = auth.uid() or public.is_deck_shared_with_me(id));
-- insert/update/delete остаются owner-only (политики auth.uid() = user_id не меняем).

-- 5. RLS cards: видеть карточку может её владелец ИЛИ гость колоды.
drop policy if exists "read own or shared cards" on public.cards;
create policy "read own or shared cards" on public.cards
  for select to authenticated
  using (user_id = auth.uid() or public.is_deck_shared_with_me(deck_id));
-- insert/update/delete остаются owner-only — гость не может менять слова.
