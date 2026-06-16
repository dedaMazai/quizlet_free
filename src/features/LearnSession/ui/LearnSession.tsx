import {
  FC, useEffect, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Empty, Progress, Result,
} from 'antd';
import {
  Card,
  useGetCardsQuery,
  useGetLearnProgressQuery,
  useSaveLearnProgressMutation,
} from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { Loader } from '@/shared/ui/Loader';
import { useLearnSession } from '../model/hooks/useLearnSession';
import { Levels } from '../model/lib/learnEngine';
import { ChoiceQuestion } from './ChoiceQuestion';
import { WriteQuestion } from './WriteQuestion';
import { AnswerFeedback } from './AnswerFeedback';
import cls from './LearnSession.module.scss';

interface LearnSessionInnerProps {
  deckUuid: string;
  cards: Card[];
  savedLevels?: Levels;
}

const LearnSessionInner: FC<LearnSessionInnerProps> = (props) => {
  const { deckUuid, cards, savedLevels } = props;
  const { t } = useTranslation();
  const [saveProgress] = useSaveLearnProgressMutation();

  const session = useLearnSession(cards, savedLevels);

  // Сохраняем прогресс при каждом изменении уровней (пропускаем первый рендер)
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    saveProgress({
      deck_uuid: deckUuid,
      levels: session.levels,
      updated_at: new Date().toISOString(),
    });
  }, [session.levels, deckUuid, saveProgress]);

  const percent = session.total
    ? Math.round((session.mastered / session.total) * 100)
    : 0;

  if (session.phase === 'finished') {
    return (
      <Result
        status="success"
        title={t('Колода выучена!')}
        subTitle={t('Вы усвоили все {{count}} слов', { count: session.total })}
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
      <VStack max gap="8">
        <HStack max justify="between" align="center">
          <MyTypography.Small type="secondary">
            {t('Раунд {{n}}', { n: session.round })}
          </MyTypography.Small>
          <MyTypography.Small type="secondary">
            {t('Усвоено')}: {session.mastered} / {session.total}
          </MyTypography.Small>
        </HStack>
        <Progress percent={percent} showInfo={false} />
      </VStack>

      <div className={cls.stage}>
        {session.phase === 'feedback' && session.question && session.lastCorrect !== null && (
          <AnswerFeedback
            card={session.question.card}
            correct={session.lastCorrect}
            userInput={session.lastInput}
            onNext={session.next}
          />
        )}

        {session.phase === 'question' && session.question?.type === 'choice' && (
          <ChoiceQuestion question={session.question} onAnswer={session.answer} />
        )}

        {session.phase === 'question' && session.question?.type === 'write' && (
          <WriteQuestion question={session.question} onAnswer={session.answer} />
        )}
      </div>

      <Button type="text" danger onClick={session.reset}>
        {t('Сбросить прогресс')}
      </Button>
    </VStack>
  );
};

interface LearnSessionProps {
  deckUuid: string;
}

export const LearnSession: FC<LearnSessionProps> = (props) => {
  const { deckUuid } = props;
  const { t } = useTranslation();

  const { data: cards, isLoading: isCardsLoading } = useGetCardsQuery(deckUuid);
  const { data: progress, isLoading: isProgressLoading } = useGetLearnProgressQuery(deckUuid);

  if (isCardsLoading || isProgressLoading) {
    return <Loader />;
  }

  if (!cards?.length) {
    return <Empty description={t('Добавьте слова в колоду, чтобы начать заучивание')} />;
  }

  return (
    <LearnSessionInner
      deckUuid={deckUuid}
      cards={cards}
      savedLevels={progress?.levels}
    />
  );
};
