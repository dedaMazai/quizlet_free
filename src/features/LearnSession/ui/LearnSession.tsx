import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Empty, Result,
} from 'antd';
import {
  Card,
  CardReview,
  levelOf,
  useGetCardReviewsQuery,
  useResetCardReviewsMutation,
} from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { Loader } from '@/shared/ui/Loader';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useLearnSession } from '../model/hooks/useLearnSession';
import { ChoiceQuestion } from './ChoiceQuestion';
import { WriteQuestion } from './WriteQuestion';
import { AnswerFeedback } from './AnswerFeedback';
import cls from './LearnSession.module.scss';

interface LearnSessionInnerProps {
  deckKey: string;
  deckName: string;
  cards: Card[];
  savedReviews?: CardReview[];
  allowReset: boolean;
  finishedTitle?: string;
  finishedSubtitle?: string;
}

const LearnSessionInner: FC<LearnSessionInnerProps> = (props) => {
  const {
    deckKey, deckName, cards, savedReviews, allowReset, finishedTitle, finishedSubtitle,
  } = props;
  const { t } = useTranslation();
  const { modal, message } = useAntdApp();
  const [resetReviews] = useResetCardReviewsMutation();

  const session = useLearnSession(cards, savedReviews, { deckKey, deckName });

  // Распределение слов по стадиям освоения: 0 — новые, 1 — изучаю, 2 — усвоено.
  // Начатая в этой сессии карточка сразу считается изучаемой, хотя в card_reviews
  // попадёт только на выпуске — иначе верный ответ визуально ничего не менял бы.
  const counts = useMemo(() => {
    const acc = { fresh: 0, learning: 0, mastered: 0 };
    cards.forEach((card) => {
      const level = levelOf(session.reviews[card.uuid] ?? null);
      const started = (session.steps[card.uuid] ?? 0) > 0;
      if (level === 2) acc.mastered += 1;
      else if (level === 1 || started) acc.learning += 1;
      else acc.fresh += 1;
    });
    return acc;
  }, [cards, session.reviews, session.steps]);

  // Сброс удаляет состояние повторения безвозвратно, поэтому спрашиваем подтверждение.
  const handleReset = () => {
    modal.confirm({
      title: t('Сбросить прогресс по {{count}} словам?', { count: cards.length }),
      content: t('Интервалы повторения обнулятся, слова снова станут новыми.'),
      okText: t('Сбросить'),
      okButtonProps: { danger: true },
      cancelText: t('Отмена'),
      onOk: async () => {
        await resetReviews(cards.map((card) => card.uuid)).unwrap();
        session.reset();
        message.success(t('Прогресс сброшен'));
      },
    });
  };

  if (session.phase === 'finished') {
    return (
      <Result
        status="success"
        title={finishedTitle ?? t('Колода выучена!')}
        subTitle={finishedSubtitle
          ?? t('Вы усвоили все {{count}} слов', { count: session.total })}
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
      <VStack max gap="10">
        <HStack max justify="between" align="center">
          <MyTypography.Small type="secondary">
            {t('Раунд {{n}}', { n: session.round })}
          </MyTypography.Small>
          <MyTypography.Small type="secondary">
            {t('Усвоено')}: {counts.mastered} / {session.total}
          </MyTypography.Small>
        </HStack>

        <div className={cls.segbar}>
          {counts.fresh > 0 && (
            <div className={cls.segFresh} style={{ flexGrow: counts.fresh }} />
          )}
          {counts.learning > 0 && (
            <div className={cls.segLearning} style={{ flexGrow: counts.learning }} />
          )}
          {counts.mastered > 0 && (
            <div className={cls.segMastered} style={{ flexGrow: counts.mastered }} />
          )}
        </div>

        <HStack max gap="16" wrap justify="center">
          <span className={cls.legendItem}>
            <i className={`${cls.dot} ${cls.dotFresh}`} />
            {t('Новые')}: {counts.fresh}
          </span>
          <span className={cls.legendItem}>
            <i className={`${cls.dot} ${cls.dotLearning}`} />
            {t('Изучаю')}: {counts.learning}
          </span>
          <span className={cls.legendItem}>
            <i className={`${cls.dot} ${cls.dotMastered}`} />
            {t('Усвоено')}: {counts.mastered}
          </span>
        </HStack>
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

      {allowReset && (
        <Button type="text" danger onClick={handleReset}>
          {t('Сбросить прогресс')}
        </Button>
      )}
    </VStack>
  );
};

interface LearnSessionProps {
  cards: Card[];
  /** Ключ журнала статистики: deck_uuid или синтетический ключ избранного/всех слов. */
  deckKey: string;
  /** Имя колоды для снапшота в статистике (для синтетических колод — сам ключ). */
  deckName: string;
  /** Колода, по которой сузить выборку повторений; не задана — берутся все. */
  reviewsDeckUuid?: string;
  /** Готовые повторения: если переданы, отдельный запрос не делается. */
  reviews?: CardReview[];
  /**
   * Показывать «Сбросить прогресс». Отключается там, где набор карточек собран
   * из разных колод (очередь повторов) — сброс стёр бы прогресс по всей библиотеке.
   */
  allowReset?: boolean;
  /** Заголовок экрана завершения; по умолчанию — «Колода выучена!». */
  finishedTitle?: string;
  finishedSubtitle?: string;
}

export const LearnSession: FC<LearnSessionProps> = (props) => {
  const {
    cards, deckKey, deckName, reviewsDeckUuid, reviews: providedReviews, allowReset = true,
    finishedTitle, finishedSubtitle,
  } = props;
  const { t } = useTranslation();

  // Очередь повторов уже приносит состояние вместе с карточками — второй запрос,
  // да ещё и по всем словам пользователя, там был бы чистой тратой.
  const { data: fetchedReviews, isLoading } = useGetCardReviewsQuery(reviewsDeckUuid, {
    skip: Boolean(providedReviews),
  });
  const reviews = providedReviews ?? fetchedReviews;

  if (isLoading) {
    return <Loader />;
  }

  if (!cards.length) {
    return <Empty description={t('Нет слов для заучивания')} />;
  }

  return (
    <LearnSessionInner
      deckKey={deckKey}
      deckName={deckName}
      cards={cards}
      savedReviews={reviews}
      allowReset={allowReset}
      finishedTitle={finishedTitle}
      finishedSubtitle={finishedSubtitle}
    />
  );
};
