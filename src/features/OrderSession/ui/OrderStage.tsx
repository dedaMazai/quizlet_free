import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'antd';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { OrderItem } from '../model/lib/orderEngine';
import cls from './OrderSession.module.scss';

interface OrderStageProps {
  item: OrderItem;
  /** Слова, ещё не перенесённые в ответ. */
  bank: string[];
  answer: string[];
  onPick: (index: number) => void;
  onUnpick: (index: number) => void;
  onCheck: () => void;
}

export const OrderStage: FC<OrderStageProps> = (props) => {
  const {
    item, bank, answer, onPick, onUnpick, onCheck,
  } = props;
  const { t } = useTranslation();

  return (
    <VStack max gap="16" align="center">
      <MyTypography.Small type="secondary">
        {t('Соберите фразу из слов')}
      </MyTypography.Small>

      <MyTypography.Large strong>{item.card.translation}</MyTypography.Large>

      {/* Строка ответа: клик по слову возвращает его в банк. */}
      <HStack max gap="8" wrap justify="center" className={cls.answerRow}>
        {answer.map((word, index) => (
          <Tag
            // Слово может повторяться в фразе, поэтому в ключе нужна позиция.
            key={`${word}-${index}`}
            className={cls.chip}
            color="processing"
            onClick={() => onUnpick(index)}
          >
            {word}
          </Tag>
        ))}
      </HStack>

      <HStack max gap="8" wrap justify="center">
        {bank.map((word, index) => (
          <Tag
            key={`${word}-${index}`}
            className={cls.chip}
            onClick={() => onPick(index)}
          >
            {word}
          </Tag>
        ))}
      </HStack>

      <Button
        type="primary"
        size="large"
        disabled={answer.length === 0}
        onClick={onCheck}
      >
        {t('Проверить')}
      </Button>
    </VStack>
  );
};
