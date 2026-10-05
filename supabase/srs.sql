-- Интервальные повторы (SRS). Прогресс хранится НА КАРТОЧКУ, а не на deck_key.
-- Выполнять вручную в Supabase SQL Editor. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.
--
-- Зачем переезд: в learn_progress прогресс лежал по (user_id, deck_key), из-за чего
-- одна карточка имела до четырёх независимых прогрессов (колода, __all_words__,
-- __favorites__, __favorites__:<uuid>). Костыль `left(deck_key,2) <> '__'` в старой
-- get_mastery существовал ровно затем, чтобы не считать одни карточки дважды.
-- PK (user_id, card_id) убирает проблему по построению.
--
-- ВАЖНО: learn_progress этим скриптом НЕ удаляется — снос вынесен в srs_cleanup.sql
-- и выполняется через 1-2 недели, когда card_reviews наполнится.


-- ============================================================================
-- 1. Таблица состояния повторения
-- ============================================================================

create table if not exists public.card_reviews (
  user_id          uuid not null references auth.users on delete cascade,
  card_id          uuid not null references public.cards(id) on delete cascade,
  level            smallint not null default 0,   -- 0|1|2, производное от reps/interval (для mastery)
  reps             integer  not null default 0,   -- успешных повторов подряд; 0 = новая или заваленная
  lapses           integer  not null default 0,   -- сколько раз забыл (диагностика «трудных» слов)
  ease             real     not null default 2.5, -- фактор лёгкости SM-2
  interval_days    real     not null default 0,   -- текущий интервал; 0 = ещё не выпущена
  due_at           timestamptz not null default now(),
  last_reviewed_at timestamptz,
  primary key (user_id, card_id)
);

-- Главный индекс: «что просрочено сейчас» — покрывает и фильтр, и сортировку.
create index if not exists card_reviews_due_idx  on public.card_reviews (user_id, due_at);
-- Обязателен под on delete cascade со стороны cards: иначе удаление карточки = seq scan.
create index if not exists card_reviews_card_idx on public.card_reviews (card_id);


-- ============================================================================
-- 2. RLS: пользователь видит и правит только свои строки
-- ============================================================================

alter table public.card_reviews enable row level security;

drop policy if exists "read own card reviews" on public.card_reviews;
create policy "read own card reviews" on public.card_reviews
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "insert own card reviews" on public.card_reviews;
create policy "insert own card reviews" on public.card_reviews
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "update own card reviews" on public.card_reviews;
create policy "update own card reviews" on public.card_reviews
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- delete нужен для кнопки «Сбросить прогресс» в сессии заучивания.
drop policy if exists "delete own card reviews" on public.card_reviews;
create policy "delete own card reviews" on public.card_reviews
  for delete to authenticated using (user_id = auth.uid());


-- ============================================================================
-- 3. Разовый бэкфилл из learn_progress
-- ============================================================================
-- Берём МАКСИМАЛЬНЫЙ уровень карточки по всем deck_key: группировка идёт по card_id,
-- deck_key в запросе не участвует, поэтому синтетические ключи вливаются сами собой.
--
-- level 2 -> interval_days = 21 (а не 3): порог mastered равен 21 дню, иначе после
-- миграции «Усвоено» резко упало бы и виджеты показали бы регресс, которого не было.
-- due_at отсчитывается от updated_at, а не от now(), иначе всё выученное обрушилось бы
-- на повтор одним днём.
--
-- join к cards обязателен: в levels могли остаться uuid удалённых карточек, без join
-- insert падает на внешнем ключе.

do $$
begin
  if not exists (select 1 from public.card_reviews) then
    insert into public.card_reviews
      (user_id, card_id, level, reps, ease, interval_days, due_at, last_reviewed_at)
    select lp.user_id,
           kv.card_id::uuid,
           max((kv.value)::int)::smallint as level,
           case max((kv.value)::int) when 2 then 3 when 1 then 1 else 0 end as reps,
           2.5 as ease,
           case max((kv.value)::int) when 2 then 21 when 1 then 1 else 0 end as interval_days,
           case max((kv.value)::int)
             when 2 then max(lp.updated_at) + interval '21 days'
             when 1 then max(lp.updated_at) + interval '1 day'
             else now()
           end as due_at,
           max(lp.updated_at) as last_reviewed_at
    from public.learn_progress lp
    cross join lateral jsonb_each_text(lp.levels) as kv(card_id, value)
    join public.cards c on c.id = kv.card_id::uuid
    group by lp.user_id, kv.card_id
    on conflict (user_id, card_id) do nothing;
  end if;
end $$;


-- ============================================================================
-- 4. Очередь повторов
-- ============================================================================

-- 4.1 Очередь на сегодня: сначала просроченные (по due_at), затем новые.
-- Просроченные и новые лимитируются раздельно, чтобы поток новых слов не вытеснял долг.
-- Карточка отдаётся целиком — иначе странице /review пришлось бы тянуть всю базу слов.
-- SECURITY INVOKER (по умолчанию): RLS на cards и card_reviews отрабатывает сама.
create or replace function public.get_due_cards(
  p_deck_id uuid default null,
  p_limit int default 50,
  p_new_limit int default 10
)
returns jsonb
language sql
stable
as $$
  with due as (
    select c.id, c.deck_id, c.term, c.translation, c.example, c.card_type,
           c.parent_card_id, c.created_at, c.updated_at,
           cr.level, cr.reps, cr.lapses, cr.ease, cr.interval_days,
           cr.due_at, cr.last_reviewed_at,
           0 as bucket
    from public.card_reviews cr
    join public.cards c on c.id = cr.card_id
    where cr.user_id = auth.uid()
      and cr.due_at <= now()
      and (p_deck_id is null or c.deck_id = p_deck_id)
    order by cr.due_at
    limit p_limit
  ),
  fresh as (
    select c.id, c.deck_id, c.term, c.translation, c.example, c.card_type,
           c.parent_card_id, c.created_at, c.updated_at,
           null::smallint as level, null::int as reps, null::int as lapses,
           null::real as ease, null::real as interval_days,
           null::timestamptz as due_at, null::timestamptz as last_reviewed_at,
           1 as bucket
    from public.cards c
    where (p_deck_id is null or c.deck_id = p_deck_id)
      and not exists (
        select 1 from public.card_reviews cr
        where cr.user_id = auth.uid() and cr.card_id = c.id
      )
    order by c.created_at
    limit p_new_limit
  )
  select coalesce(jsonb_agg(to_jsonb(t) order by t.bucket, t.due_at), '[]'::jsonb)
  from (select * from due union all select * from fresh) t;
$$;

-- 4.2 Счётчик для бейджа + дата ближайшего повтора для пустого экрана.
-- Считаем ТОЛЬКО просроченные: «N к повторению» должно означать долг,
-- а не «сколько всего доступно поучить».
create or replace function public.get_due_count(p_deck_id uuid default null)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'count', count(*) filter (where cr.due_at <= now())::int,
    'next_due_at', min(cr.due_at) filter (where cr.due_at > now())
  )
  from public.card_reviews cr
  join public.cards c on c.id = cr.card_id
  where cr.user_id = auth.uid()
    and (p_deck_id is null or c.deck_id = p_deck_id);
$$;


-- ============================================================================
-- 5. get_mastery на card_reviews
-- ============================================================================
-- ПЕРЕЕХАЛА в user_progress.sql (необязательный p_user_id для экрана /users/:id).
-- Определение удалено отсюда, иначе повторный прогон создал бы вторую перегрузку.


-- ============================================================================
-- 6. leave_shared_deck: критерий «нулевого прогресса» переезжает на card_reviews
-- ============================================================================
-- Без этой правки функция молча сломается: клиент перестанет писать в learn_progress,
-- и «нулевым прогрессом» будет считаться любая, даже выученная колода.
create or replace function public.leave_shared_deck(p_deck_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  has_progress boolean;
begin
  delete from public.deck_shares
  where deck_id = p_deck_id and user_id = auth.uid();

  select exists (
    select 1
    from public.card_reviews cr
    join public.cards c on c.id = cr.card_id
    where cr.user_id = auth.uid()
      and c.deck_id = p_deck_id
      and cr.level > 0
  ) into has_progress;

  if not has_progress then
    delete from public.card_reviews cr
    using public.cards c
    where cr.card_id = c.id
      and cr.user_id = auth.uid()
      and c.deck_id = p_deck_id;

    delete from public.study_events
    where user_id = auth.uid()
      and deck_key in (p_deck_id::text, '__favorites__:' || p_deck_id::text);
  end if;
end;
$$;


grant execute on function public.get_due_cards(uuid, int, int) to authenticated;
grant execute on function public.get_due_count(uuid) to authenticated;
grant execute on function public.leave_shared_deck(uuid) to authenticated;
