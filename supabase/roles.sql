-- Роли пользователей (admin/user) и поля профиля для личного кабинета.
-- Выполнять вручную в Supabase SQL Editor. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.
-- Зависит от supabase/sharing.sql (таблица public.profiles).

-- 1. Расширяем profiles полями профиля и ролью.
alter table public.profiles add column if not exists surname text;
alter table public.profiles add column if not exists middle_name text;
alter table public.profiles add column if not exists tel text;
alter table public.profiles add column if not exists description text;
alter table public.profiles add column if not exists avatar text;        -- ключ пресета аватарки, напр. 'avatar-3'
alter table public.profiles add column if not exists role text not null default 'user';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'user'));

-- 2. Назначение первого админа (выполнить один раз вручную, раскомментировав):
-- update public.profiles set role = 'admin' where email = 'anreikrytoi@gmail.com';

-- 3. is_admin — текущий пользователь админ? Используется в RPC и в AI-функциях (ai.sql).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- 4. RLS: пользователь может править свою строку profiles.
alter table public.profiles enable row level security;

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 5. Защита роли: обычный пользователь не может изменить свою роль через update profiles.
-- Менять роль разрешено только админу (и через RPC set_user_role).
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Защищаем только запросы реального авторизованного пользователя (есть JWT → auth.uid() не null).
  -- В SQL Editor / под service_role auth.uid() = null — там роль менять можно (бутстрап первого админа).
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role_trg on public.profiles;
create trigger protect_profile_role_trg
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- 6. set_user_role — смена роли другого пользователя (только админ).
create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  if p_role not in ('admin', 'user') then
    raise exception 'INVALID_ROLE';
  end if;
  update public.profiles set role = p_role where id = p_user_id;
end;
$$;

-- 7. delete_user — удаление пользователя (только админ, нельзя удалить себя).
-- Удаление из auth.users каскадом сносит profiles/decks/cards/прогресс (FK on delete cascade).
create or replace function public.delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'CANNOT_DELETE_SELF';
  end if;
  delete from auth.users where id = p_user_id;
end;
$$;
