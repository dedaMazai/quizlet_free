import {
  FC, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Empty } from 'antd';
import {
  Card,
  CardReview,
  LEARNING_STEPS,
  useGetCardReviewsQuery,
  useResetCardReviewsMutation,
} from '@/entities/Card';
import { AnswerFeedback, AnswerFeedbackTone } from '@/shared/ui/AnswerFeedback';
import { SessionStage, SessionStageGap } from '@/shared/ui/SessionStage';
import { SessionTopBar } from '@/shared/ui/SessionTopBar';
import { Loader } from '@/shared/ui/Loader';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useAutoSpeak } from '@/shared/lib/hooks/useAutoSpeak';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { useSpeech } from '@/shared/lib/hooks/useSpeech';
import {
  buildSessionTicks,
  SessionResultRenderer,
  summarizeSession,
  useIntervalNote,
} from '@/shared/lib/session';
import { useLearnSession } from '../model/hooks/useLearnSession';
import { LearnQuestion } from '../model/lib/learnEngine';
import { ChoiceQuestion } from './ChoiceQuestion';
import { WriteQuestion } from './WriteQuestion';
import cls from './LearnSession.module.scss';

/** Вопрос, на который уже ответили: варианты пересобираются после ANSWER, держим снимок. */
interface AnsweredQuestion {
  question: LearnQuestion;
  input: string;
}

interface SessionChrome {
  /** Название в топбаре: «Колода · Заучивание». */
  title: string;
  onExit: () => void;
  renderResult: SessionResultRenderer;
}

interface LearnSessionInnerProps extends SessionChrome {
  deckKey: string;
  deckName: string;
  cards: Card[];
  savedReviews?: CardReview[];
  allowReset: boolean;
}

const LearnSessionInner: FC<LearnSessionInnerProps> = (props) => {
  const {
    deckKey, deckName, cards, savedReviews, allowReset, title, onExit, renderResult,
  } = props;
  const { t } = useTranslation();
  const { modal, message } = useAntdApp();
  const [resetReviews] = useResetCardReviewsMutation();
  const { autoSpeak, toggleAutoSpeak } = useAutoSpeak();
  const { speak } = useSpeech();
  const { isMobile } = useMatchMedia();
  const [answered, setAnswered] = useState<AnsweredQuestion | null>(null);

  const session = useLearnSession(cards, savedReviews, { deckKey, deckName });

  // Стадии карточек в рамках ЭТОЙ сессии (не SRS-уровень): «усвоено» — прошла
  // все шаги, «изучаю» — начата, «новые» — шаг 0 (сюда же попадает карточка,
  // сброшенная ошибкой). Так прогресс всегда стартует с нуля и монотонно растёт:
  // выпущенные карточки в раунды больше не попадают и назад не откатываются.
  const counts = useMemo(() => {
    const acc = { fresh: 0, learning: 0, mastered: 0 };
    cards.forEach((card) => {
      const step = session.steps[card.uuid] ?? 0;
      if (step >= LEARNING_STEPS) acc.mastered += 1;
      else if (step > 0) acc.learning += 1;
      else acc.fresh += 1;
    });
    return acc;
  }, [cards, session.steps]);

  // Автоозвучка правильного слова при показе фидбэка
  const answeredTerm = answered?.question.card.term;
  useEffect(() => {
    if (answeredTerm && autoSpeak) speak(answeredTerm, 'en-US');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered]);

  const handleAnswer = (value: string) => {
    if (!session.question) return;
    setAnswered({ question: session.question, input: value });
    session.answer(value);
  };

  const handleNext = () => {
    setAnswered(null);
    session.next();
  };

  const restart = () => {
    setAnswered(null);
    session.reset();
  };

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
        restart();
        message.success(t('Прогресс сброшен'));
      },
    });
  };

  const correctSubtitle = useIntervalNote(session.lastReview?.interval_days);

  const finished = session.phase === 'finished';
  const summary = useMemo(
    () => (finished ? summarizeSession(session.answers, session.startedAt) : null),
    [finished, session.answers, session.startedAt],
  );

  const settings = (
    <div className={cls.settings}>
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
      {allowReset && (
        <Button type="text" danger size="small" onClick={handleReset}>
          {t('Сбросить прогресс')}
        </Button>
      )}
    </div>
  );

  const topBar = (
    <SessionTopBar
      title={title}
      counter={t('Раунд {{n}} · {{done}} / {{total}}', {
        n: session.round, done: counts.mastered, total: session.total,
      })}
      ticks={buildSessionTicks(session.answers, session.phase === 'question')}
      onExit={onExit}
      autoSpeak={autoSpeak}
      onToggleAutoSpeak={toggleAutoSpeak}
      settings={settings}
    />
  );

  if (summary) {
    return (
      <>
        {topBar}
        {renderResult(summary, restart)}
      </>
    );
  }

  const feedback = session.phase === 'feedback' ? answered : null;
  const question = feedback?.question ?? (session.phase === 'question' ? session.question : null);
  const correct = feedback ? session.lastCorrect === true : false;


  // Перевод ошибочно выбранного варианта — варианты это term'ы других карточек
  const chosenCard = feedback && !correct
    ? cards.find((card) => card.term === feedback.input)
    : undefined;
  // Мобильный макет — короче: «Вернётся в этой сессии»
  const returnNote = isMobile ? t('Вернётся в этой сессии') : t('Слово вернётся в эту же сессию');
  const wrongSubtitle = chosenCard
    ? `«${chosenCard.term}» — ${chosenCard.translation}. ${returnNote}`
    : returnNote;
  const wrongTitle = isMobile
    ? t('Правильно — «{{term}}»', { term: question?.card.term })
    : t('Неверно — правильно «{{term}}»', { term: question?.card.term });

  return (
    <>
      {topBar}
      {question?.type === 'choice' && (
        <SessionStage gap={SessionStageGap.XL}>
          <ChoiceQuestion
            question={question}
            chosen={feedback ? feedback.input : null}
            onAnswer={handleAnswer}
          />
          {feedback && (
            <AnswerFeedback
              tone={correct ? AnswerFeedbackTone.SUCCESS : AnswerFeedbackTone.ERROR}
              title={correct ? t('Верно') : wrongTitle}
              subtitle={correct ? correctSubtitle : wrongSubtitle}
              onNext={handleNext}
              autoAdvance={correct}
            />
          )}
        </SessionStage>
      )}

      {question?.type === 'write' && (
        <SessionStage gap={SessionStageGap.MD}>
          <WriteQuestion
            question={question}
            answered={feedback ? { input: feedback.input, correct } : null}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        </SessionStage>
      )}

      {/* Кадр между рефетчем карточек и PRUNE: вопроса ещё нет, тупика быть не должно. */}
      {!question && (
        <SessionStage>
          <Loader />
        </SessionStage>
      )}
    </>
  );
};

interface LearnSessionProps extends SessionChrome {
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
}

export const LearnSession: FC<LearnSessionProps> = (props) => {
  const {
    cards, deckKey, deckName, reviewsDeckUuid, reviews: providedReviews, allowReset = true,
    title, onExit, renderResult,
  } = props;
  const { t } = useTranslation();

  // Очередь повторов уже приносит состояние вместе с карточками — второй запрос,
  // да ещё и по всем словам пользователя, там был бы чистой тратой.
  const { data: fetchedReviews, isLoading } = useGetCardReviewsQuery(reviewsDeckUuid, {
    skip: Boolean(providedReviews),
  });
  const reviews = providedReviews ?? fetchedReviews;

  if (isLoading || !cards.length) {
    return (
      <>
        <SessionTopBar
          title={title}
          counter=""
          ticks={buildSessionTicks([], false)}
          onExit={onExit}
        />
        <SessionStage>
          {isLoading ? <Loader /> : <Empty description={t('Нет слов для заучивания')} />}
        </SessionStage>
      </>
    );
  }

  return (
    <LearnSessionInner
      key={deckKey}
      deckKey={deckKey}
      deckName={deckName}
      cards={cards}
      savedReviews={reviews}
      allowReset={allowReset}
      title={title}
      onExit={onExit}
      renderResult={renderResult}
    />
  );
};
