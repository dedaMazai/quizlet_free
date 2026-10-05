-- Библиотека (экраны 6.3–6.5): «Все слова» и «Избранное» со статусом и датой показа.
-- Выполнять вручную в Supabase SQL Editor ПОСЛЕ srs.sql и chunks.sql. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.


-- ============================================================================
-- get_library_cards: страница слов вместе с состоянием повторения
-- ============================================================================
-- Фильтры совпадают с getCardsPage (поиск по слову/переводу/примеру, колода, список id)
-- плюс тип карточки и статус. Статус — как в get_mastery: level 2 «усвоено»,
-- level 1 «изучаю», иначе (нет строки или level 0) «новое»; «due» — пора повторять.
-- p_limit null — без пагинации (сессия «Заучивать выборку»).
-- Возвращает jsonb, а не setof: на jsonb не действует лимит PostgREST в 1000 строк.
-- SECURITY INVOKER (по умолчанию): RLS на cards и card_reviews отрабатывает сама.
create or replace function public.get_library_cards(
  p_search  text    default null,
  p_deck_id uuid    default null,
  p_status  text    default null,
  p_type    text    default null,
  p_ids     uuid[]  default null,
  p_offset  int     default 0,
  p_limit   int     default null
)
returns jsonb
language sql
stable
as $$
  with filtered as (
    select c.id, c.deck_id, c.term, c.translation, c.example, c.card_type,
           c.parent_card_id, c.created_at, c.updated_at,
           cr.level, cr.reps, cr.lapses, cr.ease, cr.interval_days, cr.due_at, cr.last_reviewed_at
    from public.cards c
    left join public.card_reviews cr on cr.card_id = c.id and cr.user_id = auth.uid()
    where (p_deck_id is null or c.deck_id = p_deck_id)
      and (p_ids is null or c.id = any(p_ids))
      and (p_type is null or c.card_type = p_type)
      and (
        nullif(btrim(p_search), '') is null
        or position(lower(btrim(p_search)) in lower(c.term)) > 0
        or position(lower(btrim(p_search)) in lower(c.translation)) > 0
        or position(lower(btrim(p_search)) in lower(coalesce(c.example, ''))) > 0
      )
      and (
        p_status is null
        or (p_status = 'new' and coalesce(cr.level, 0) = 0)
        or (p_status = 'learning' and cr.level = 1)
        or (p_status = 'mastered' and cr.level = 2)
        or (p_status = 'due' and cr.due_at <= now())
      )
  ),
  page as (
    select *
    from filtered
    order by created_at, id
    offset greatest(p_offset, 0)
    limit p_limit
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered),
    'deck_count', (select count(distinct deck_id) from filtered),
    'cards', (
      select coalesce(jsonb_agg(to_jsonb(page) order by created_at, id), '[]'::jsonb)
      from page
    )
  );
$$;

grant execute on function public.get_library_cards(text, uuid, text, text, uuid[], int, int) to authenticated;
