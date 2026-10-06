-- Контакты (взаимные, с подтверждением) и уведомления.
-- Колодой можно поделиться только с контактом: выбор из списка вместо ввода чужого email.
-- Выполнять вручную в Supabase SQL Editor ПОСЛЕ sharing.sql, roles.sql, privacy.sql.
-- Скрипт идемпотентный. См. memory `supabase-backend`: схема ведётся вручную, миграций нет.
-- Выполнить ДО деплоя фронта: фронт делится колодой через share_deck_with_contacts.
--
-- Приватность: ни один RPC не сообщает, зарегистрирован ли email. Запрос по адресу
-- без аккаунта, своему адресу или уже добавленному контакту отвечает так же, как успешный.


-- ============================================================================
-- 1. contacts: по строке на каждую сторону пары, у каждой своя метка
-- ============================================================================
create table if not exists public.contacts (
  user_id uuid not null references auth.users on delete cascade,
  contact_id uuid not null references auth.users on delete cascade,
  label text check (label in ('friend', 'student', 'teacher')),
  created_at timestamptz not null default now(),
  primary key (user_id, contact_id),
  check (user_id <> contact_id)
);

create index if not exists contacts_contact_id_idx on public.contacts (contact_id);

alter table public.contacts enable row level security;

drop policy if exists "read own contacts" on public.contacts;
create policy "read own contacts" on public.contacts
  for select to authenticated using (user_id = auth.uid());

-- Метку правит только владелец строки; остальные колонки клиенту не меняются.
drop policy if exists "update own contact label" on public.contacts;
create policy "update own contact label" on public.contacts
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke insert, update, delete on public.contacts from anon, authenticated;
grant update (label) on public.contacts to authenticated;

-- Пользователь у меня в контактах?
create or replace function public.is_my_contact(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.contacts where user_id = auth.uid() and contact_id = p_user_id
  );
$$;


-- ============================================================================
-- 2. contact_requests: входящие запросы. Отправитель свои исходящие не видит —
--    иначе по наличию строки было бы понятно, что адрес зарегистрирован.
-- ============================================================================
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references auth.users on delete cascade,
  to_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  unique (from_id, to_id),
  check (from_id <> to_id)
);

create index if not exists contact_requests_to_id_idx on public.contact_requests (to_id);

alter table public.contact_requests enable row level security;
-- Политик нет: читается через get_contact_requests, пишется через RPC.
revoke all on public.contact_requests from anon, authenticated;

-- Журнал попыток для суточного лимита. Пишется на каждую попытку, даже если адреса нет,
-- поэтому лимит тоже ничего не раскрывает.
create table if not exists public.contact_request_attempts (
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists contact_request_attempts_user_idx
  on public.contact_request_attempts (user_id, created_at);

alter table public.contact_request_attempts enable row level security;
revoke all on public.contact_request_attempts from anon, authenticated;


-- ============================================================================
-- 3. contact_invites: одна активная ссылка-приглашение на пользователя
-- ============================================================================
create table if not exists public.contact_invites (
  user_id uuid primary key references auth.users on delete cascade,
  token text unique not null,
  expires_at timestamptz not null
);

alter table public.contact_invites enable row level security;
revoke all on public.contact_invites from anon, authenticated;


-- ============================================================================
-- 4. notifications: колокольчик. Пишут только security definer RPC ниже.
-- ============================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  type text not null check (type in ('contact_request', 'contact_accepted', 'deck_shared')),
  actor_id uuid references auth.users on delete cascade,
  entity_id uuid,
  -- Снимок на момент события: {actor_name, deck_name}. Текст собирает фронт через i18n.
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "read own notifications" on public.notifications;
create policy "read own notifications" on public.notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "mark own notifications read" on public.notifications;
create policy "mark own notifications read" on public.notifications
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "delete own notifications" on public.notifications;
create policy "delete own notifications" on public.notifications
  for delete to authenticated using (user_id = auth.uid());

revoke insert, update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Realtime: новые уведомления приходят клиенту сразу (RLS select применяется и тут).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
     ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
end;
$$;


-- ============================================================================
-- 5. Внутренние хелперы (клиенту не выдаются)
-- ============================================================================
-- Как показывать пользователя в уведомлениях: имя, иначе email.
create or replace function public.profile_display_name(p_user_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(nullif(trim(name), ''), email) from public.profiles where id = p_user_id;
$$;

create or replace function public.notify_user(
  p_user_id uuid, p_type text, p_actor_id uuid, p_entity_id uuid, p_payload jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, type, actor_id, entity_id, payload)
  values (p_user_id, p_type, p_actor_id, p_entity_id, p_payload);
$$;

-- Связать двоих взаимно и снять запросы между ними в обе стороны.
create or replace function public.link_contacts(p_a uuid, p_b uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.contacts (user_id, contact_id) values (p_a, p_b), (p_b, p_a)
  on conflict do nothing;
  delete from public.contact_requests
  where (from_id = p_a and to_id = p_b) or (from_id = p_b and to_id = p_a);
$$;

revoke execute on function public.profile_display_name(uuid) from public, anon, authenticated;
revoke execute on function public.notify_user(uuid, text, uuid, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.link_contacts(uuid, uuid) from public, anon, authenticated;


-- ============================================================================
-- 6. RPC: запросы в контакты
-- ============================================================================
create or replace function public.request_contact_by_email(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  target_id uuid;
  request_id uuid;
begin
  if me is null then raise exception 'NOT_AUTHENTICATED'; end if;

  if (select count(*) from public.contact_request_attempts
      where user_id = me and created_at > now() - interval '1 day') >= 20 then
    raise exception 'RATE_LIMIT';
  end if;
  insert into public.contact_request_attempts (user_id) values (me);

  select id into target_id from public.profiles where email = lower(trim(p_email));

  -- Нет аккаунта, свой адрес, уже в контактах — ничего не делаем и ничего не сообщаем.
  if target_id is null or target_id = me
     or exists (select 1 from public.contacts where user_id = me and contact_id = target_id) then
    return;
  end if;

  -- Встречный запрос уже ждёт ответа — это взаимное согласие.
  if exists (select 1 from public.contact_requests where from_id = target_id and to_id = me) then
    perform public.link_contacts(me, target_id);
    perform public.notify_user(target_id, 'contact_accepted', me, me,
      jsonb_build_object('actor_name', public.profile_display_name(me)));
    return;
  end if;

  insert into public.contact_requests (from_id, to_id) values (me, target_id)
  on conflict do nothing
  returning id into request_id;

  -- Повторный запрос не дублирует уведомление.
  if request_id is not null then
    perform public.notify_user(target_id, 'contact_request', me, request_id,
      jsonb_build_object('actor_name', public.profile_display_name(me)));
  end if;
end;
$$;

-- Входящие запросы: отправитель сам обратился по адресу, поэтому его имя и email видны.
create or replace function public.get_contact_requests()
returns table (id uuid, from_id uuid, email text, name text, avatar text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select r.id, r.from_id, p.email, p.name, p.avatar, r.created_at
  from public.contact_requests r
  join public.profiles p on p.id = r.from_id
  where r.to_id = auth.uid()
  order by r.created_at desc;
$$;

create or replace function public.respond_contact_request(p_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  sender_id uuid;
begin
  select from_id into sender_id from public.contact_requests where id = p_id and to_id = me;
  if sender_id is null then raise exception 'REQUEST_NOT_FOUND'; end if;

  if p_accept then
    perform public.link_contacts(me, sender_id);
    perform public.notify_user(sender_id, 'contact_accepted', me, me,
      jsonb_build_object('actor_name', public.profile_display_name(me)));
  else
    delete from public.contact_requests where id = p_id;
  end if;

  -- Уведомление о запросе больше не актуально.
  delete from public.notifications
  where user_id = me and type = 'contact_request' and entity_id = p_id;
end;
$$;


-- ============================================================================
-- 7. RPC: ссылка-приглашение
-- ============================================================================
-- Выдаёт действующую ссылку или перевыпускает её (p_renew): старая перестаёт работать.
create or replace function public.create_contact_invite(p_renew boolean default false)
returns table (token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'NOT_AUTHENTICATED'; end if;

  if p_renew or not exists (
    select 1 from public.contact_invites i where i.user_id = me and i.expires_at > now()
  ) then
    insert into public.contact_invites (user_id, token, expires_at)
    values (me, replace(gen_random_uuid()::text, '-', ''), now() + interval '7 days')
    on conflict (user_id) do update
      set token = excluded.token, expires_at = excluded.expires_at;
  end if;

  return query
    select i.token, i.expires_at from public.contact_invites i where i.user_id = me;
end;
$$;

-- Кто приглашает — для экрана подтверждения. Ссылку могли переслать дальше,
-- поэтому email не отдаём целиком: только имя, без имени — замаскированный адрес.
create or replace function public.get_contact_invite(p_token text)
returns table (inviter_name text, avatar text, is_self boolean, is_contact boolean)
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce(
      nullif(trim(p.name), ''),
      left(split_part(p.email, '@', 1), 2) || '***@' || split_part(p.email, '@', 2)
    ),
    p.avatar,
    p.id = auth.uid(),
    public.is_my_contact(p.id)
  from public.contact_invites i
  join public.profiles p on p.id = i.user_id
  where i.token = p_token and i.expires_at > now();
$$;

create or replace function public.accept_contact_invite(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  inviter_id uuid;
begin
  select user_id into inviter_id from public.contact_invites
  where token = p_token and expires_at > now();
  if inviter_id is null then raise exception 'INVITE_INVALID'; end if;
  if inviter_id = me then raise exception 'INVITE_SELF'; end if;
  if exists (select 1 from public.contacts where user_id = me and contact_id = inviter_id) then
    return;
  end if;

  perform public.link_contacts(me, inviter_id);
  perform public.notify_user(inviter_id, 'contact_accepted', me, me,
    jsonb_build_object('actor_name', public.profile_display_name(me)));
end;
$$;


-- ============================================================================
-- 8. RPC: список контактов
-- ============================================================================
create or replace function public.get_my_contacts()
returns table (id uuid, email text, name text, avatar text, label text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.email, p.name, p.avatar, c.label, c.created_at
  from public.contacts c
  join public.profiles p on p.id = c.contact_id
  where c.user_id = auth.uid()
  order by coalesce(nullif(trim(p.name), ''), p.email);
$$;

-- Разрывает связь с обеих сторон. Доступы к колодам не трогает — их закрывает владелец.
create or replace function public.remove_contact(p_contact_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.contacts
  where (user_id = auth.uid() and contact_id = p_contact_id)
     or (user_id = p_contact_id and contact_id = auth.uid());
$$;


-- ============================================================================
-- 9. Шаринг колоды контактам (заменяет share_deck_by_email)
-- ============================================================================
create or replace function public.share_deck_with_contacts(p_deck_id uuid, p_user_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  deck_name text;
  target uuid;
  inserted boolean;
begin
  select name into deck_name from public.decks where id = p_deck_id and user_id = me;
  if deck_name is null then raise exception 'NOT_OWNER'; end if;

  if exists (
    select 1 from unnest(p_user_ids) u(id)
    where not exists (select 1 from public.contacts where user_id = me and contact_id = u.id)
  ) then
    raise exception 'NOT_CONTACT';
  end if;

  foreach target in array p_user_ids loop
    insert into public.deck_shares (deck_id, user_id) values (p_deck_id, target)
    on conflict do nothing
    returning true into inserted;

    if inserted then
      perform public.notify_user(target, 'deck_shared', me, p_deck_id,
        jsonb_build_object('actor_name', public.profile_display_name(me), 'deck_name', deck_name));
    end if;
    inserted := null;
  end loop;
end;
$$;

-- Шаринг по email раскрывал, зарегистрирован ли адрес (USER_NOT_FOUND). Удалён и из sharing.sql.
drop function if exists public.share_deck_by_email(uuid, text);


-- ============================================================================
-- 10. get_profiles_brief ПЕРЕЕХАЛА сюда из privacy.sql: теперь видны и контакты.
--     В privacy.sql функция вырезана, иначе её повторный прогон откатил бы эту версию.
-- ============================================================================
create or replace function public.get_profiles_brief(p_ids uuid[])
returns table (id uuid, email text, name text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.email, p.name
  from public.profiles p
  where p.id = any (p_ids)
    and (p.id = auth.uid() or public.is_admin()
      or public.shares_deck_with(p.id) or public.is_my_contact(p.id));
$$;


-- ============================================================================
-- 11. Бэкфилл: те, кто уже делит колоду, становятся контактами
--     (имя и email друг друга они и так видели через get_profiles_brief).
-- ============================================================================
insert into public.contacts (user_id, contact_id)
select distinct d.user_id, s.user_id
from public.deck_shares s join public.decks d on d.id = s.deck_id
where d.user_id <> s.user_id
union
select distinct s.user_id, d.user_id
from public.deck_shares s join public.decks d on d.id = s.deck_id
where d.user_id <> s.user_id
on conflict do nothing;


-- ============================================================================
-- 12. Права
-- ============================================================================
revoke execute on function public.is_my_contact(uuid) from public, anon;
revoke execute on function public.request_contact_by_email(text) from public, anon;
revoke execute on function public.get_contact_requests() from public, anon;
revoke execute on function public.respond_contact_request(uuid, boolean) from public, anon;
revoke execute on function public.create_contact_invite(boolean) from public, anon;
revoke execute on function public.get_contact_invite(text) from public, anon;
revoke execute on function public.accept_contact_invite(text) from public, anon;
revoke execute on function public.get_my_contacts() from public, anon;
revoke execute on function public.remove_contact(uuid) from public, anon;
revoke execute on function public.share_deck_with_contacts(uuid, uuid[]) from public, anon;
revoke execute on function public.get_profiles_brief(uuid[]) from public, anon;

grant execute on function public.is_my_contact(uuid) to authenticated;
grant execute on function public.request_contact_by_email(text) to authenticated;
grant execute on function public.get_contact_requests() to authenticated;
grant execute on function public.respond_contact_request(uuid, boolean) to authenticated;
grant execute on function public.create_contact_invite(boolean) to authenticated;
grant execute on function public.get_contact_invite(text) to authenticated;
grant execute on function public.accept_contact_invite(text) to authenticated;
grant execute on function public.get_my_contacts() to authenticated;
grant execute on function public.remove_contact(uuid) to authenticated;
grant execute on function public.share_deck_with_contacts(uuid, uuid[]) to authenticated;
grant execute on function public.get_profiles_brief(uuid[]) to authenticated;
