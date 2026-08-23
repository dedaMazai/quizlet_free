-- Снос старой таблицы прогресса learn_progress (завершение перехода на card_reviews).
-- Выполнять вручную в Supabase SQL Editor, ПОСЛЕ srs.sql. Скрипт идемпотентный.
-- См. memory `supabase-backend`: схема в этом проекте ведётся вручную, миграций нет.
--
-- Предусловие: card_reviews наполнена (бэкфилл из srs.sql отработал). Скрипт
-- проверяет это сам и отказывается работать на пустой таблице — иначе можно
-- снести источник данных, не перенеся прогресс.
--
-- Данные не теряются: перед удалением делается снимок learn_progress_backup.
-- Он и остаётся страховкой на случай отката фронта на предыдущую версию.

do $$
declare
  reviews_count bigint;
begin
  -- Если learn_progress уже снесена — повторный прогон ничего не делает.
  if to_regclass('public.learn_progress') is null then
    raise notice 'learn_progress уже удалена — пропускаем';
    return;
  end if;

  select count(*) into reviews_count from public.card_reviews;
  if reviews_count = 0 then
    raise exception
      'card_reviews пуста: сначала выполните srs.sql, иначе прогресс будет потерян';
  end if;

  -- Снимок на случай отката.
  if to_regclass('public.learn_progress_backup') is null then
    create table public.learn_progress_backup as
      select * from public.learn_progress;
  end if;

  drop table public.learn_progress;
  raise notice 'learn_progress удалена, снимок в learn_progress_backup (card_reviews: % строк)',
    reviews_count;
end $$;

-- Кодовая часть уже выполнена: getLearnProgress/saveLearnProgress, ApiTag.LearnProgress
-- и тип LearnProgress удалены из фронта. CardLevel переехал в types/cardReview.ts.
