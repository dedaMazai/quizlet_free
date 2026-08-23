import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Empty, Progress, Result,
} from 'antd';
import { Card, useGetCardReviewsQuery } from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useClozeSession } from '../model/hooks/useClozeSession';
import { ClozeSetup } from './ClozeSetup';
import { ClozePrompt } from './ClozePrompt';
import { ClozeFeedback } from './ClozeFeedback';
import cls from './ClozeSession.module.scss';

interface ClozeSessionProps {
  cards: Card[];
  /** Ключ колоды для журнала статистики. */
  deckKey: string;
  /** Имя колоды для снапшота в статистике. */
  deckName: string;
  /** Колода, по которой сузить выборку повторений. */
  reviewsDeckUuid?: string;
}

export const ClozeSession: FC<ClozeSessionProps> = (props) => {
  const {
    cards, deckKey, deckName, reviewsDeckUuid,
  } = props;
  const { t } = useTranslation();

  const { data: reviews } = useGetCardReviewsQuery(reviewsDeckUuid);
  const session = useClozeSession(cards, reviews, { deckKey, deckName });

  if (!cards.length) {
    return <Empty description={t('Нет слов для заучивания')} />;
  }

  if (session.phase === 'setup') {
    return (
      <ClozeSetup
        fitting={session.fitting}
        total={cards.length}
        defaultTypoTolerance={session.typoTolerance}
        onStart={session.start}
      />
    );
  }

  if (session.phase === 'finished') {
    return (
      <Result
        status="success"
        title={t('Все пропуски заполнены!')}
        subTitle={t('Слов: {{count}}, ошибок: {{wrong}}, с опечаткой: {{almost}}', {
          count: session.total,
          wrong: session.counters.wrong,
          almost: session.counters.almost,
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
          <ClozePrompt
            item={session.current}
            onAnswer={session.answer}
            onSkip={session.skip}
          />
        )}

        {session.phase === 'feedback' && session.current && session.lastGrade && (
          <ClozeFeedback
            item={session.current}
            grade={session.lastGrade}
            userInput={session.lastInput}
            onNext={session.next}
          />
        )}
      </div>
    </VStack>
  );
};
