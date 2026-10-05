import { CSSProperties, FC, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetDecksQuery } from '@/entities/Deck';
import { useGetDeckProgressQuery, useGetMasteryQuery } from '@/entities/Statistics';
import { Blueprint } from '@/shared/ui/Blueprint';
import { MASTERY_SUCCESS_THRESHOLD } from '@/shared/ui/MasteryBar';
import { Skeleton } from '@/shared/ui/Skeleton';
import { RoutePath } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './DeckProgressList.module.scss';

const PERCENT = 100;
/** Сколько колод показывать — остальные по ссылке «Все N» */
const VISIBLE_DECKS = 5;
const SKELETON_ROWS = Array.from({ length: VISIBLE_DECKS }, (_, i) => i);

interface DeckProgressListProps {
  className?: string;
  tz: string;
}

interface DeckRow {
  key: string;
  name: string;
  percent: number;
}

const percentOf = (part: number, total: number): number => (
  total > 0 ? Math.round((part / total) * PERCENT) : 0
);

/** Освоенность колод: 5 лучших, от 80% — сигналом «результат» (6.23) */
export const DeckProgressList: FC<DeckProgressListProps> = ({ className, tz }) => {
  const { t } = useTranslation();
  const { data: mastery, isLoading: masteryLoading } = useGetMasteryQuery();
  const { data: progress, isLoading: progressLoading } = useGetDeckProgressQuery(tz);
  const { data: decks, isLoading: decksLoading } = useGetDecksQuery();
  const loading = masteryLoading || progressLoading || decksLoading;

  const rows = useMemo<DeckRow[]>(() => {
    // Пока колоды не загружены, строки не строим — иначе всё отфильтруется и блок мигнёт.
    if (!decks) return [];
    const liveNames = new Map(decks.map((d) => [d.uuid, d.name]));

    // Только реальные колоды: удалённые и отшаренные скрываем, а синтетические ключи
    // журнала («Избранное», «Все слова», «К повторению») дали бы строки с нулевой
    // освоенностью — прогресс с переходом на card_reviews считается по колодам.
    const isAccessible = (deckKey: string): boolean => liveNames.has(deckKey);

    const labelFor = (deckKey: string): string => liveNames.get(deckKey) || t('Колода');

    const byKey = new Map<string, DeckRow>();
    (mastery?.perDeck ?? []).forEach((d) => {
      if (!isAccessible(d.deckKey)) return;
      byKey.set(d.deckKey, {
        key: d.deckKey,
        name: labelFor(d.deckKey),
        percent: percentOf(d.mastered, d.new + d.learning + d.mastered),
      });
    });
    (progress ?? []).forEach((p) => {
      if (!isAccessible(p.deckKey)) return;
      if (!byKey.has(p.deckKey)) {
        byKey.set(p.deckKey, {
          key: p.deckKey, name: labelFor(p.deckKey), percent: 0,
        });
      }
    });

    return Array.from(byKey.values())
      .sort((a, b) => b.percent - a.percent)
      .slice(0, VISIBLE_DECKS);
  }, [mastery, progress, decks, t]);

  if (loading) {
    return (
      <Blueprint className={classNames(cls.DeckProgressList, [className])}>
        <div className={cls.header}>
          <span className={cls.title}>{t('По колодам')}</span>
        </div>
        {SKELETON_ROWS.map((i) => (
          <div key={i} className={cls.row}>
            <Skeleton className={cls.nameSkeleton} />
            <Skeleton className={cls.trackSkeleton} />
            <Skeleton className={cls.percentSkeleton} />
          </div>
        ))}
      </Blueprint>
    );
  }

  if (!rows.length) return null;

  return (
    <Blueprint className={classNames(cls.DeckProgressList, [className])}>
      <div className={cls.header}>
        <span className={cls.title}>{t('По колодам')}</span>
        <Link to={RoutePath.DECKS()} className={cls.all}>
          {t('Все {{value}}', { value: decks?.length ?? 0 })}
        </Link>
      </div>
      {rows.map((r) => (
        <div key={r.key} className={cls.row}>
          <span className={cls.name}>{r.name}</span>
          <div className={cls.track}>
            <div
              className={classNames(cls.fill, [], {
                [cls.success]: r.percent >= MASTERY_SUCCESS_THRESHOLD,
              })}
              // Ширина — данные, а не оформление
              style={{ '--percent': `${r.percent}%` } as CSSProperties}
            />
          </div>
          <span className={cls.percent}>{`${r.percent}%`}</span>
        </div>
      ))}
    </Blueprint>
  );
};
