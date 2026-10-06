-- Защита персональных данных (152-ФЗ): закрытие утечек, согласия, удаление аккаунта, журнал админа.
-- Выполнять вручную в Supabase SQL Editor ПОСЛЕ sharing.sql, roles.sql, block.sql, ai.sql, account.sql.
-- Скрипт идемпотентный. См. memory `supabase-backend`: схема ведётся вручную, миграций нет.
-- Выполнить ДО деплоя фронта: фронт читает чужие профили только через get_profiles_brief.


-- ============================================================================
-- 1. learn_progress_backup: снимок старого прогресса был открыт всем через API
-- ============================================================================
-- Таблица создана `create table ... as select` (srs_cleanup.sql) — без RLS, а Supabase
-- по умолчанию выдаёт anon/authenticated права на таблицы public. Аноним читал строки
-- (проверено 2026-10-06: content-range */21 без входа). RLS без политик закрывает API,
-- снимок остаётся доступен в SQL Editor / service role.
do $$
begin
  if to_regclass('public.learn_progress_backup') is not null then
    execute 'alter table public.learn_progress_backup enable row level security';
    execute 'revoke all on public.learn_progress_backup from anon, authenticated';
  end if;
end;
$$;


-- ============================================================================
-- 2. profiles: строку целиком видит только сам пользователь и администратор
-- ============================================================================
-- Раньше политика была `using (true)`: любой вошедший читал email, ФИО, телефон,
-- «о себе» и часовой пояс всех пользователей.
drop policy if exists "profiles readable by authenticated" on public.profiles;
drop policy if exists "read own profile or admin" on public.profiles;
create policy "read own profile or admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- Связаны ли два пользователя общей колодой (в любую сторону).
create or replace function public.shares_deck_with(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.deck_shares s
    join public.decks d on d.id = s.deck_id
    where (d.user_id = auth.uid() and s.user_id = p_user_id)
       or (s.user_id = auth.uid() and d.user_id = p_user_id)
  );
$$;

-- get_profiles_brief ПЕРЕЕХАЛА в contacts.sql (имя и email видят ещё и контакты).
-- Здесь намеренно удалена, иначе повторный прогон этого скрипта откатил бы новую версию.

revoke execute on function public.shares_deck_with(uuid) from public, anon;
grant execute on function public.shares_deck_with(uuid) to authenticated;


-- ============================================================================
-- 3. user_consents: согласия и принятие документов (доказательство для 152-ФЗ)
-- ============================================================================
-- Одна строка — один документ одной редакции. Пишут только триггер регистрации
-- и RPC accept_legal_documents; пользователь читает свои строки, менять их не может.
create table if not exists public.user_consents (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users on delete cascade,
  -- terms — пользовательское соглашение, pd_consent — согласие на обработку ПДн
  document     text not null check (document in ('terms', 'pd_consent')),
  version      text not null,
  accepted_at  timestamptz not null default now(),
  -- signup — галочки при регистрации, reaccept — принятие новой редакции после входа
  source       text not null check (source in ('signup', 'reaccept')),
  unique (user_id, document, version)
);

create index if not exists user_consents_user_idx on public.user_consents (user_id);

alter table public.user_consents enable row level security;

drop policy if exists "read own consents" on public.user_consents;
create policy "read own consents" on public.user_consents
  for select to authenticated
  using (user_id = auth.uid());

-- Регистрация: фронт кладёт версию принятых документов в user metadata
-- (signUp options.data.legal_version) только при отмеченных галочках.
create or replace function public.record_signup_consent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version text := new.raw_user_meta_data->>'legal_version';
begin
  if v_version is not null and v_version <> '' then
    insert into public.user_consents (user_id, document, version, source)
    values (new.id, 'terms', v_version, 'signup'),
           (new.id, 'pd_consent', v_version, 'signup')
    on conflict (user_id, document, version) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_consent on auth.users;
create trigger on_auth_user_created_consent
  after insert on auth.users
  for each row execute function public.record_signup_consent();

-- Принятие документов уже зарегистрированным пользователем (новая редакция,
-- аккаунты до появления согласий, вход через Telegram).
create or replace function public.accept_legal_documents(p_version text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  if p_version is null or p_version = '' then
    raise exception 'BAD_VERSION';
  end if;
  insert into public.user_consents (user_id, document, version, source)
  values (auth.uid(), 'terms', p_version, 'reaccept'),
         (auth.uid(), 'pd_consent', p_version, 'reaccept')
  on conflict (user_id, document, version) do nothing;
end;
$$;

-- Принял ли текущий пользователь обе редакции документов.
create or replace function public.has_accepted_legal(p_version text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select count(distinct document) = 2
  from public.user_consents
  where user_id = auth.uid() and version = p_version;
$$;

revoke execute on function public.accept_legal_documents(text) from public, anon;
revoke execute on function public.has_accepted_legal(text) from public, anon;
grant execute on function public.accept_legal_documents(text) to authenticated;
grant execute on function public.has_accepted_legal(text) to authenticated;


-- ============================================================================
-- 4. admin_audit_log: действия администратора с чужими аккаунтами
-- ============================================================================
-- Хранит только идентификаторы (без email/ФИО), чтобы журнал не копил ПДн удалённых.
-- Записи старше 1 года удаляются при каждой новой записи — срок из Политики.
create table if not exists public.admin_audit_log (
  id              bigint generated always as identity primary key,
  admin_id        uuid,
  target_user_id  uuid not null,
  action          text not null,
  details         jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at);

alter table public.admin_audit_log enable row level security;

drop policy if exists "admins read audit log" on public.admin_audit_log;
create policy "admins read audit log" on public.admin_audit_log
  for select to authenticated
  using (public.is_admin());
-- Insert-политики нет: пишут security definer триггеры и service role (impersonate-user).

create or replace function public.write_admin_audit(
  p_target uuid, p_action text, p_details jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_audit_log (admin_id, target_user_id, action, details)
  values (auth.uid(), p_target, p_action, p_details);
  delete from public.admin_audit_log where created_at < now() - interval '1 year';
end;
$$;

-- Функция журнала вызывается только из триггеров ниже, клиентам она недоступна.
revoke execute on function public.write_admin_audit(uuid, text, jsonb) from public, anon, authenticated;

-- Триггер на profiles, а не правка RPC из roles.sql/block.sql/ai.sql: повторный прогон
-- тех скриптов не снимет логирование. Пишем только изменения чужого профиля.
create or replace function public.audit_profile_admin_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() = coalesce(new.id, old.id) then
    return coalesce(new, old);
  end if;

  if tg_op = 'DELETE' then
    perform public.write_admin_audit(old.id, 'delete_user');
    return old;
  end if;

  if new.role is distinct from old.role then
    perform public.write_admin_audit(new.id, 'set_role',
      jsonb_build_object('from', old.role, 'to', new.role));
  end if;
  if new.blocked is distinct from old.blocked then
    perform public.write_admin_audit(new.id, case when new.blocked then 'block' else 'unblock' end);
  end if;
  if new.ai_limit is distinct from old.ai_limit then
    perform public.write_admin_audit(new.id, 'set_ai_limit',
      jsonb_build_object('from', old.ai_limit, 'to', new.ai_limit));
  end if;
  return new;
end;
$$;

drop trigger if exists audit_profile_admin_changes_trg on public.profiles;
create trigger audit_profile_admin_changes_trg
  after update or delete on public.profiles
  for each row execute function public.audit_profile_admin_changes();


-- ============================================================================
-- 5. delete_my_account: пользователь удаляет аккаунт и все свои данные сам
-- ============================================================================
-- Удаление из auth.users каскадом сносит profiles, колоды, карточки, прогресс,
-- историю ответов, циклы, настройки, согласия и привязку Telegram (FK on delete cascade).
-- Снимок learn_progress_backup связей не имеет — чистим вручную.
-- Администратор себя не удаляет: иначе можно остаться без админов.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  if public.is_admin() then
    raise exception 'ADMIN_CANNOT_SELF_DELETE';
  end if;

  if to_regclass('public.learn_progress_backup') is not null then
    execute 'delete from public.learn_progress_backup where user_id = $1' using v_uid;
  end if;

  delete from auth.users where id = v_uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
