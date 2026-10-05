import { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import { Card, useGetCardReviewsQuery } from '@/entities/Card';
import { AnswerFeedback, AnswerFeedbackTone } from '@/shared/ui/AnswerFeedback';
import { SessionStage, SessionStageGap } from '@/shared/ui/SessionStage';
import { SessionTopBar } from '@/shared/ui/SessionTopBar';
import { useAutoSpeak } from '@/shared/lib/hooks/useAutoSpeak';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { useSpeech } from '@/shared/lib/hooks/useSpeech';
import {
  buildSessionTicks,
  SessionResultRenderer,
  summarizeSession,
  useIntervalNote,
} from '@/shared/lib/session';
import { EmptyState, EmptyStateAlign } from '@/shared/ui/EmptyState';
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
  /** Название в топбаре: «Колода · Собери фразу». */
  title: string;
  onExit: () => void;
  renderResult: SessionResultRenderer;
}

export const OrderSession: FC<OrderSessionProps> = (props) => {
  const {
    cards, deckKey, deckName, reviewsDeckUuid, title, onExit, renderResult,
  } = props;
  const { t } = useTranslation();
  const { isMobile } = useMatchMedia();
  // На мобильном — формулировка макета 6.45, как в заучивании
  const wrongTitle = (term: string) => (isMobile
    ? t('Правильно — «{{term}}»', { term })
    : t('Неверно — правильно «{{term}}»', { term }));
  const { autoSpeak, toggleAutoSpeak } = useAutoSpeak();
  const { speak } = useSpeech();

  const { data: reviews } = useGetCardReviewsQuery(reviewsDeckUuid);
  const session = useOrderSession(cards, reviews, { deckKey, deckName });
  const correctNote = useIntervalNote(session.lastReview?.interval_days);

  // Автоозвучка фразы при показе фидбэка
  const spokenTerm = session.phase === 'feedback' ? session.current?.card.term : undefined;
  useEffect(() => {
    if (spokenTerm && autoSpeak) speak(spokenTerm, 'en-US');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spokenTerm, session.answers.length]);

  const finished = session.phase === 'finished';
  const summary = useMemo(
    () => (finished && session.total > 0 ? summarizeSession(session.answers, session.startedAt) : null),
    [finished, session.total, session.answers, session.startedAt],
  );

  const topBar = (
    <SessionTopBar
      title={title}
      counter={`${session.done} / ${session.total}`}
      ticks={buildSessionTicks(session.answers, session.phase === 'question')}
      onExit={onExit}
      autoSpeak={autoSpeak}
      onToggleAutoSpeak={toggleAutoSpeak}
    />
  );

  // Режим работает только с карточками-фразами: собирать одно слово бессмысленно.
  if (session.total === 0) {
    return (
      <>
        {topBar}
        <SessionStage>
          <EmptyState icon={Inbox} kicker={t('Собери фразу')} title={t('В колоде нет фраз для сборки')} description={t('Отметьте слова как фразы или подберите их через ИИ')} align={EmptyStateAlign.CENTER} />
        </SessionStage>
      </>
    );
  }

  if (summary) {
    return (
      <>
        {topBar}
        {renderResult(summary, session.reset)}
      </>
    );
  }

  const checked = session.phase === 'feedback' && session.lastCorrect !== null;

  return (
    <>
      {topBar}
      <SessionStage gap={SessionStageGap.LG} className={cls.stage}>
        {session.current && (
          <OrderStage
            item={session.current}
            answer={session.answer}
            checked={checked}
            onPick={session.pick}
            onUnpick={session.unpick}
            onCheck={session.check}
          />
        )}

        {checked && session.current && (
          <AnswerFeedback
            tone={session.lastCorrect ? AnswerFeedbackTone.SUCCESS : AnswerFeedbackTone.ERROR}
            title={session.lastCorrect
              ? t('Верно')
              : wrongTitle(session.current.card.term)}
            subtitle={session.lastCorrect
              ? correctNote
              : isMobile ? t('Вернётся в этой сессии') : t('Фраза вернётся в эту же сессию')}
            onNext={session.next}
            autoAdvance={Boolean(session.lastCorrect)}
          />
        )}
      </SessionStage>
    </>
  );
};
