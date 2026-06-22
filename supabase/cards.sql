-- Пакетное обновление карточек одним запросом (для применения правок ИИ-проверки).
-- Выполнять вручную в Supabase SQL Editor. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.

-- update_cards_bulk — обновляет перевод и пример сразу у множества карточек за один UPDATE.
-- SECURITY INVOKER (по умолчанию): RLS update-политики cards (owner-only) соблюдаются,
-- пользователь может изменить только свои карточки.
create or replace function public.update_cards_bulk(p_cards jsonb)
returns void
language sql
as $$
  update public.cards c
  set translation = x.translation,
      example = x.example,
      updated_at = now()
  from jsonb_to_recordset(p_cards) as x(id uuid, translation text, example text)
  where c.id = x.id;
$$;
