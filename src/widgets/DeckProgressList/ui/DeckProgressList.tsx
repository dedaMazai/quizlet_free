import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'antd';
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
  key: string;
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
        mastered: d.mastered,
        total: d.new + d.learning + d.mastered,
      });
    });
    (progress ?? []).forEach((p) => {
      if (!isAccessible(p.deckKey)) return;
      if (!byKey.has(p.deckKey)) {
        byKey.set(p.deckKey, {
          key: p.deckKey, name: labelFor(p.deckKey), mastered: 0, total: 0,
        });
      }
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
              <VStack max gap="6" key={r.key}>
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
