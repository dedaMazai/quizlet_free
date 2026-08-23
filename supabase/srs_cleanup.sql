-- Снос старой таблицы прогресса learn_progress.
--
-- ВЫПОЛНЯТЬ НЕ РАНЬШЕ, чем через 1-2 недели после выката srs.sql, убедившись,
-- что card_reviews наполняется. Миграций в проекте нет, поэтому откат = «вернуть
-- предыдущий фронт», и он должен найти свои данные на месте.
--
-- Перед сносом проверить, что перенос состоялся:
--   select count(*) from public.card_reviews;
--   select count(distinct kv.card_id)
--   from public.learn_progress lp
--   cross join lateral jsonb_each_text(lp.levels) kv(card_id, value);

create table if not exists public.learn_progress_backup as
  select * from public.learn_progress;

drop table if exists public.learn_progress;

-- После прогона убрать в коде: getLearnProgress/saveLearnProgress в cardApi.ts,
-- их хуки в бочке entities/Card, ApiTag.LearnProgress в rtkApi.ts и тип LearnProgress.
-- CardLevel НЕ удалять — его использует srs.ts.
