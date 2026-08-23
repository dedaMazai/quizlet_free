import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Empty, Progress, Result,
} from 'antd';
import { Card, useGetCardReviewsQuery } from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useWriteSession } from '../model/hooks/useWriteSession';
import { WriteSetup } from './WriteSetup';
import { WritePrompt } from './WritePrompt';
import { WriteFeedback } from './WriteFeedback';
import cls from './WriteSession.module.scss';

interface WriteSessionProps {
  cards: Card[];
  /** Ключ колоды для журнала статистики. */
  deckKey: string;
  /** Имя колоды для снапшота в статистике. */
  deckName: string;
  /** Колода, по которой сузить выборку повторений; не задана — берутся все. */
  reviewsDeckUuid?: string;
}

export const WriteSession: FC<WriteSessionProps> = (props) => {
  const {
    cards, deckKey, deckName, reviewsDeckUuid,
  } = props;
  const { t } = useTranslation();

  const { data: reviews } = useGetCardReviewsQuery(reviewsDeckUuid);
  const session = useWriteSession(cards, reviews, { deckKey, deckName });

  if (!cards.length) {
    return <Empty description={t('Нет слов для письма')} />;
  }

  if (session.phase === 'setup') {
    return <WriteSetup defaults={session.settings} onStart={session.start} />;
  }

  if (session.phase === 'finished') {
    return (
      <Result
        status="success"
        title={t('Все слова написаны!')}
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
          percent={(session.done / session.total) * 100}
          showInfo={false}
        />
      </VStack>

      <div className={cls.stage}>
        {session.phase === 'feedback' && session.currentCard && session.lastGrade && (
          <WriteFeedback
            card={session.currentCard}
            grade={session.lastGrade}
            expected={session.expected}
            userInput={session.lastInput}
            onNext={session.next}
          />
        )}

        {session.phase === 'question' && session.currentCard && (
          <WritePrompt
            card={session.currentCard}
            prompt={session.prompt}
            direction={session.settings.direction}
            onAnswer={session.answer}
            onSkip={session.skip}
          />
        )}
      </div>
    </VStack>
  );
};
