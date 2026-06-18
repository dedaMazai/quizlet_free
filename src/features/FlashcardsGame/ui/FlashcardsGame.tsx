import {
  FC, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Empty } from 'antd';
import {
  LeftOutlined, RightOutlined, RetweetOutlined,
} from '@ant-design/icons';
import { Card, FavoriteToggle } from '@/entities/Card';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useArrowPressed } from '@/shared/lib/hooks/useArrowPressed';
import { shuffle } from '@/shared/lib/utils';
import cls from './FlashcardsGame.module.scss';

interface FlashcardsGameProps {
  cards: Card[];
}

export const FlashcardsGame: FC<FlashcardsGameProps> = (props) => {
  const { cards } = props;
  const { t } = useTranslation();

  const [order, setOrder] = useState<Card[]>(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setOrder(cards);
    setIndex(0);
    setFlipped(false);
  }, [cards]);

  const current = order[index];

  const goPrev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + order.length) % order.length);
  };

  const goNext = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % order.length);
  };

  const handleShuffle = () => {
    setOrder(shuffle(order));
    setIndex(0);
    setFlipped(false);
  };

  // Навигация стрелками клавиатуры
  const { left, right } = useArrowPressed();
  useEffect(() => {
    if (left) goPrev();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);
  useEffect(() => {
    if (right) goNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [right]);

  const progress = useMemo(
    () => `${order.length ? index + 1 : 0} / ${order.length}`,
    [index, order.length],
  );

  if (!cards.length) {
    return <Empty description={t('В колоде нет слов')} />;
  }

  return (
    <VStack max gap="16" align="center">
      <MyTypography.Base type="secondary">{progress}</MyTypography.Base>

      <div
        className={classNames(cls.card, { [cls.flipped]: flipped })}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={cls.inner}>
          <div className={cls.front}>
            <MyTypography.ExtraLarge strong>{current.term}</MyTypography.ExtraLarge>
            <div className={cls.speak} onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={current.term} />
            </div>
          </div>
          <div className={cls.back}>
            <MyTypography.ExtraLarge strong>{current.translation}</MyTypography.ExtraLarge>
            {current.example && (
              <MyTypography.Small type="secondary">{current.example}</MyTypography.Small>
            )}
          </div>
        </div>
      </div>

      <MyTypography.Small type="secondary">
        {t('Нажмите на карточку, чтобы перевернуть')}
      </MyTypography.Small>

      <HStack gap="12" justify="center" wrap>
        <FavoriteToggle cardUuid={current.uuid} />
        <Button icon={<LeftOutlined />} onClick={goPrev}>
          {t('Назад')}
        </Button>
        <Button icon={<RetweetOutlined />} onClick={handleShuffle}>
          {t('Перемешать')}
        </Button>
        <Button type="primary" onClick={goNext}>
          {t('Далее')} <RightOutlined />
        </Button>
      </HStack>
    </VStack>
  );
};
