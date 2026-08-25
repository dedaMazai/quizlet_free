import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert, Button, Statistic, Typography,
} from 'antd';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';

interface DeckBreakdownItem {
  deckUuid: string;
  deckName: string;
  /** Просроченные карточки колоды в этой сессии. */
  dueCount: number;
  /** Новые (ещё не изучавшиеся) карточки колоды в этой сессии. */
  freshCount: number;
}

interface ReviewPreviewProps {
  dueCount: number;
  freshCount: number;
  byDeck: DeckBreakdownItem[];
  onStart: () => void;
}

export const ReviewPreview: FC<ReviewPreviewProps> = (props) => {
  const {
    dueCount, freshCount, byDeck, onStart,
  } = props;
  const { t } = useTranslation();

  return (
    <VStack max gap="24">
      <HStack gap="32">
        <Statistic title={t('Слов к повторению')} value={dueCount} />
        <Statistic title={t('Новых слов')} value={freshCount} />
      </HStack>

      <Alert
        type="info"
        showIcon
        title={t('Правильный ответ увеличивает интервал до следующего показа, ошибка сбрасывает его — слово вернётся раньше.')}
      />

      <VStack max gap="8">
        {byDeck.map((item) => (
          <HStack max justify="between" gap="16" key={item.deckUuid}>
            <Typography.Text strong>{item.deckName}</Typography.Text>
            <MyTypography.Small type="secondary">
              {t('{{due}} к повторению · {{fresh}} новых', {
                due: item.dueCount,
                fresh: item.freshCount,
              })}
            </MyTypography.Small>
          </HStack>
        ))}
      </VStack>

      <Button type="primary" size="large" onClick={onStart}>
        {t('Начать повторение')}
      </Button>
    </VStack>
  );
};
