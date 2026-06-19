import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ALL_WORDS_PROGRESS_KEY,
  FAVORITES_PROGRESS_KEY,
} from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { useGetDeckProgressQuery, useGetMasteryQuery } from '@/entities/Statistics';
import { HorizontalBarChart } from '@/shared/ui/HorizontalBarChart';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { classNames } from '@/shared/lib/classNames/classNames';

interface DeckProgressListProps {
  className?: string;
  tz: string;
}

const COLOR_MASTERED = '#69bb80';
const COLOR_TOTAL = '#bfbfbf';
const ROW_HEIGHT = 56;
const MIN_HEIGHT = 200;

interface DeckRow {
  name: string;
  mastered: number;
  total: number;
}

export const DeckProgressList: FC<DeckProgressListProps> = ({ className, tz }) => {
  const { t } = useTranslation();
  const { data: mastery } = useGetMasteryQuery();
  const { data: progress } = useGetDeckProgressQuery(tz);
  const { data: decks } = useGetDecksQuery();

  const rows = useMemo<DeckRow[]>(() => {
    const liveNames = new Map((decks ?? []).map((d) => [d.uuid, d.name]));

    const labelFor = (deckKey: string, snapshot: string | null): string => {
      if (deckKey === FAVORITES_PROGRESS_KEY) return t('Избранное');
      if (deckKey === ALL_WORDS_PROGRESS_KEY) return t('Все слова');
      return liveNames.get(deckKey) || snapshot || t('Колода');
    };

    const byKey = new Map<string, DeckRow>();
    (mastery?.perDeck ?? []).forEach((d) => {
      byKey.set(d.deckKey, {
        name: labelFor(d.deckKey, null),
        mastered: d.mastered,
        total: d.new + d.learning + d.mastered,
      });
    });
    (progress ?? []).forEach((p) => {
      const existing = byKey.get(p.deckKey);
      const name = labelFor(p.deckKey, p.deckName);
      if (existing) existing.name = name;
      else byKey.set(p.deckKey, { name, mastered: 0, total: 0 });
    });

    return Array.from(byKey.values());
  }, [mastery, progress, decks, t]);

  if (!rows.length) return null;

  return (
    <VStack max gap="8" className={classNames('', [className])}>
      <MyTypography.Small type="secondary">{t('Прогресс по колодам')}</MyTypography.Small>
      <HorizontalBarChart
        labels={rows.map((r) => r.name)}
        datasets={[
          { label: 'Усвоено', data: rows.map((r) => r.mastered), color: COLOR_MASTERED },
          { label: 'Всего слов', data: rows.map((r) => r.total), color: COLOR_TOTAL },
        ]}
        height={Math.max(MIN_HEIGHT, rows.length * ROW_HEIGHT)}
      />
    </VStack>
  );
};
