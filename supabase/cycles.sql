-- Циклы заучивания: собственный упорядоченный список слов, который открывается
-- порциями по N слов в день и повторяется целиком строго по порядку.
-- Каждое слово помнит номер порции, в которой его открыли (portion), поэтому
-- удаление и перестановка слов не меняют, что уже открыто, а что ещё в очереди.
-- Выполнять вручную в Supabase SQL Editor. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.


-- ============================================================================
-- 1. Таблицы
-- ============================================================================

create table if not exists public.learning_cycles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users on delete cascade,
  name            text not null,
  daily_new_count smallint not null default 10 check (daily_new_count > 0),
  current_portion integer  not null default 0,  -- номер текущей (сегодняшней) порции
  portion_date    date,                         -- день открытия текущей порции
  start_word_id   uuid,                         -- точка старта повтора (FK ниже)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists learning_cycles_user_idx on public.learning_cycles (user_id);

create table if not exists public.learning_cycle_words (
  id           uuid primary key default gen_random_uuid(),
  cycle_id     uuid not null references public.learning_cycles(id) on delete cascade,
  user_id      uuid not null default auth.uid() references auth.users on delete cascade,
  term         text not null,
  translation  text not null,
  position     integer not null,
  portion      integer,                        -- в какой порции открыто; null — ещё в очереди
  is_important boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists learning_cycle_words_cycle_idx
  on public.learning_cycle_words (cycle_id, position);

-- Циклическая ссылка: точка старта указывает на слово своего цикла.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'learning_cycles_start_word_fkey'
  ) then
    alter table public.learning_cycles
      add constraint learning_cycles_start_word_fkey
      foreign key (start_word_id) references public.learning_cycle_words(id) on delete set null;
  end if;
end $$;


-- ============================================================================
-- 2. RLS: каждый видит и меняет только свои строки
-- ============================================================================

alter table public.learning_cycles enable row level security;

drop policy if exists "read own cycles" on public.learning_cycles;
create policy "read own cycles" on public.learning_cycles
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "insert own cycles" on public.learning_cycles;
create policy "insert own cycles" on public.learning_cycles
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "update own cycles" on public.learning_cycles;
create policy "update own cycles" on public.learning_cycles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "delete own cycles" on public.learning_cycles;
create policy "delete own cycles" on public.learning_cycles
  for delete to authenticated using (user_id = auth.uid());

alter table public.learning_cycle_words enable row level security;

drop policy if exists "read own cycle words" on public.learning_cycle_words;
create policy "read own cycle words" on public.learning_cycle_words
  for select to authenticated using (user_id = auth.uid());
-- Слово можно добавить только в собственный цикл.
drop policy if exists "insert own cycle words" on public.learning_cycle_words;
create policy "insert own cycle words" on public.learning_cycle_words
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (select 1 from public.learning_cycles c where c.id = cycle_id and c.user_id = auth.uid())
  );
drop policy if exists "update own cycle words" on public.learning_cycle_words;
create policy "update own cycle words" on public.learning_cycle_words
  for update to authenticated using (user_id = auth.uid()) with check (
    user_id = auth.uid()
    and exists (select 1 from public.learning_cycles c where c.id = cycle_id and c.user_id = auth.uid())
  );
drop policy if exists "delete own cycle words" on public.learning_cycle_words;
create policy "delete own cycle words" on public.learning_cycle_words
  for delete to authenticated using (user_id = auth.uid());


-- ============================================================================
-- 3. Перестановка слов одним вызовом: position = индекс в массиве
-- ============================================================================

-- SECURITY INVOKER: RLS ограничивает обновление своими словами.
create or replace function public.reorder_cycle_words(p_cycle_id uuid, p_word_ids uuid[])
returns void
language sql
as $$
  update public.learning_cycle_words w
  set position = t.ord - 1
  from unnest(p_word_ids) with ordinality as t(id, ord)
  where w.id = t.id and w.cycle_id = p_cycle_id;
$$;

grant execute on function public.reorder_cycle_words(uuid, uuid[]) to authenticated;


-- ============================================================================
-- 4. Открытие порции слов
-- ============================================================================

-- В новый календарный день (или принудительно — кнопка «Новый день») начинается
-- новая порция; затем текущая порция доливается до daily_new_count первыми по
-- порядку словами из очереди. Дата передаётся с клиента: «день» — локальный
-- день пользователя, а не UTC сервера.
create or replace function public.sync_cycle_portion(
  p_cycle_id uuid,
  p_today date,
  p_force_new boolean default false
)
returns void
language plpgsql
as $$
declare
  v_cycle  public.learning_cycles%rowtype;
  v_opened integer;
begin
  -- Блокировка строки цикла: две вкладки не откроют порцию дважды.
  select * into v_cycle from public.learning_cycles where id = p_cycle_id for update;
  if not found then
    return;
  end if;

  if p_force_new or v_cycle.portion_date is distinct from p_today then
    v_cycle.current_portion := v_cycle.current_portion + 1;
    update public.learning_cycles
    set current_portion = v_cycle.current_portion, portion_date = p_today, updated_at = now()
    where id = p_cycle_id;
  end if;

  select count(*) into v_opened
  from public.learning_cycle_words
  where cycle_id = p_cycle_id and portion = v_cycle.current_portion;

  if v_opened < v_cycle.daily_new_count then
    update public.learning_cycle_words
    set portion = v_cycle.current_portion
    where id in (
      select id from public.learning_cycle_words
      where cycle_id = p_cycle_id and portion is null
      order by position, created_at
      limit v_cycle.daily_new_count - v_opened
    );
  end if;
end;
$$;

grant execute on function public.sync_cycle_portion(uuid, date, boolean) to authenticated;
