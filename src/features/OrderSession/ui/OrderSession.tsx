import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Empty, Progress, Result,
} from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Card, FavoriteToggle, useGetCardReviewsQuery } from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useOrderSession } from '../model/hooks/useOrderSession';
import { OrderStage } from './OrderStage';
import cls from './OrderSession.module.scss';

interface OrderSessionProps {
  cards: Card[];
  /** Ключ колоды для журнала статистики. */
  deckKey: string;
  /** Имя колоды для снапшота в статистике. */
  deckName: string;
  /** Колода, по которой сузить выборку повторений. */
  reviewsDeckUuid?: string;
}

export const OrderSession: FC<OrderSessionProps> = (props) => {
  const {
    cards, deckKey, deckName, reviewsDeckUuid,
  } = props;
  const { t } = useTranslation();

  const { data: reviews } = useGetCardReviewsQuery(reviewsDeckUuid);
  const session = useOrderSession(cards, reviews, { deckKey, deckName });

  // Режим работает только с карточками-фразами: собирать одно слово бессмысленно.
  if (session.total === 0) {
    return (
      <Empty description={t('В колоде нет фраз для сборки')}>
        <MyTypography.Small type="secondary">
          {t('Отметьте слова как фразы или подберите их через ИИ')}
        </MyTypography.Small>
      </Empty>
    );
  }

  if (session.phase === 'finished') {
    return (
      <Result
        status="success"
        title={t('Все фразы собраны!')}
        subTitle={t('Фраз: {{count}}, ошибок: {{wrong}}', {
          count: session.total,
          wrong: session.wrong,
        })}
        extra={(
          <Button type="primary" onClick={session.reset}>
            {t('Пройти заново')}
          </Button>
        )}
      />
    );
  }

  return (
    <VStack max gap="24" align="center">
      <VStack max gap="4" className={cls.progressRow}>
        <HStack max justify="between" align="center">
          <MyTypography.Small type="secondary">{t('Прогресс')}</MyTypography.Small>
          <MyTypography.Small type="secondary">
            {session.done} / {session.total}
          </MyTypography.Small>
        </HStack>
        <Progress
          percent={session.total ? (session.done / session.total) * 100 : 0}
          showInfo={false}
          size="small"
        />
      </VStack>

      <div className={cls.stage}>
        {session.phase === 'question' && session.current && (
          <OrderStage
            item={session.current}
            bank={session.bank}
            answer={session.answer}
            onPick={session.pick}
            onUnpick={session.unpick}
            onCheck={session.check}
          />
        )}

        {session.phase === 'feedback' && session.current && session.lastCorrect !== null && (
          <VStack max gap="16" align="center">
            <div
              className={classNames(
                cls.feedbackIcon,
                [session.lastCorrect ? cls.correct : cls.wrong],
              )}
            >
              {session.lastCorrect ? <CheckCircleFilled /> : <CloseCircleFilled />}
            </div>

            <MyTypography.Large strong>
              {session.lastCorrect ? t('Верно') : t('Неверно')}
            </MyTypography.Large>

            <HStack gap="8" align="center">
              <MyTypography.Base strong>{session.current.card.term}</MyTypography.Base>
              <SpeakButton text={session.current.card.term} />
              <FavoriteToggle cardUuid={session.current.card.uuid} />
            </HStack>

            {session.current.card.example && (
              <MyTypography.Base type="secondary" className={cls.example}>
                {session.current.card.example}
              </MyTypography.Base>
            )}

            <Button type="primary" size="large" onClick={session.next} autoFocus>
              {t('Продолжить')}
            </Button>
          </VStack>
        )}
      </div>
    </VStack>
  );
};
