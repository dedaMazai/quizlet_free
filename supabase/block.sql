-- Блокировка пользователей администратором. Заблокированный не может войти.
-- Выполнять вручную в Supabase SQL Editor. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема ведётся вручную, миграций нет.
-- Зависит от supabase/roles.sql (функция public.is_admin, таблица public.profiles).

-- 1. Поля блокировки в profiles.
alter table public.profiles add column if not exists blocked boolean not null default false;
alter table public.profiles add column if not exists blocked_at timestamptz;
alter table public.profiles add column if not exists blocked_by uuid;

-- 2. set_user_blocked — блокировка/разблокировка другого пользователя (только админ, нельзя себя).
-- Помимо флага в profiles ставит нативный бан в auth.users.banned_until:
-- GoTrue отклоняет и вход (signInWithPassword), и обновление токена забаненного пользователя.
create or replace function public.set_user_blocked(p_user_id uuid, p_blocked boolean)
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
    raise exception 'CANNOT_BLOCK_SELF';
  end if;

  update public.profiles
  set blocked = p_blocked,
      blocked_at = case when p_blocked then now() else null end,
      blocked_by = case when p_blocked then auth.uid() else null end
  where id = p_user_id;

  update auth.users
  set banned_until = case when p_blocked then 'infinity'::timestamptz else null end
  where id = p_user_id;
end;
$$;
