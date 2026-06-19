import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'antd';
import {
  ALL_WORDS_PROGRESS_KEY,
  FAVORITES_PROGRESS_KEY,
} from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { useGetDeckProgressQuery, useGetMasteryQuery } from '@/entities/Statistics';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './DeckProgressList.module.scss';

interface DeckProgressListProps {
  className?: string;
  tz: string;
}

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
    <Card className={classNames(cls.card, [className])} variant="borderless">
      <VStack max gap="16">
        <div className={cls.cardTitle}>{t('Прогресс по колодам')}</div>
        <VStack max gap="16">
          {rows.map((r) => {
            const percent = r.total > 0 ? Math.round((r.mastered / r.total) * 100) : 0;
            return (
              <VStack max gap="6" key={r.name}>
                <HStack max justify="between" align="center" gap="12">
                  <MyTypography.Base className={cls.name}>{r.name}</MyTypography.Base>
                  <MyTypography.Small type="secondary">
                    {`${r.mastered}/${r.total} · ${percent}%`}
                  </MyTypography.Small>
                </HStack>
                <div className={cls.track}>
                  <div className={cls.fill} style={{ width: `${percent}%` }} />
                </div>
              </VStack>
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
};
