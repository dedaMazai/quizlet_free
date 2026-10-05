import { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Empty } from 'antd';
import { Card, useGetCardReviewsQuery } from '@/entities/Card';
import { SessionStage, SessionStageGap } from '@/shared/ui/SessionStage';
import { SessionTopBar } from '@/shared/ui/SessionTopBar';
import { useAutoSpeak } from '@/shared/lib/hooks/useAutoSpeak';
import { useSpeech } from '@/shared/lib/hooks/useSpeech';
import {
  buildSessionTicks,
  SessionResultRenderer,
  summarizeSession,
  useIntervalNote,
} from '@/shared/lib/session';
import { useClozeSession } from '../model/hooks/useClozeSession';
import { ClozeSetup } from './ClozeSetup';
import { ClozePrompt } from './ClozePrompt';

interface ClozeSessionProps {
  cards: Card[];
  /** Ключ колоды для журнала статистики. */
  deckKey: string;
  /** Имя колоды для снапшота в статистике. */
  deckName: string;
  /** Колода, по которой сузить выборку повторений. */
  reviewsDeckUuid?: string;
  /** Название в топбаре: «Колода · Пропуски». */
  title: string;
  onExit: () => void;
  renderResult: SessionResultRenderer;
}

export const ClozeSession: FC<ClozeSessionProps> = (props) => {
  const {
    cards, deckKey, deckName, reviewsDeckUuid, title, onExit, renderResult,
  } = props;
  const { t } = useTranslation();
  const { autoSpeak, toggleAutoSpeak } = useAutoSpeak();
  const { speak } = useSpeech();

  const { data: reviews } = useGetCardReviewsQuery(reviewsDeckUuid);
  const session = useClozeSession(cards, reviews, { deckKey, deckName });
  const correctNote = useIntervalNote(session.lastReview?.interval_days);

  // Автоозвучка английского слова при показе фидбэка
  const spokenTerm = session.phase === 'feedback' ? session.current?.card.term : undefined;
  useEffect(() => {
    if (spokenTerm && autoSpeak) speak(spokenTerm, 'en-US');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spokenTerm, session.answers.length]);

  const finished = session.phase === 'finished';
  const summary = useMemo(
    () => (finished ? summarizeSession(session.answers, session.startedAt) : null),
    [finished, session.answers, session.startedAt],
  );

  const topBar = (
    <SessionTopBar
      title={title}
      counter={`${session.done} / ${session.phase === 'setup' ? session.fitting : session.total}`}
      ticks={buildSessionTicks(session.answers, session.phase === 'question')}
      onExit={onExit}
      autoSpeak={autoSpeak}
      onToggleAutoSpeak={toggleAutoSpeak}
    />
  );

  if (!cards.length) {
    return (
      <>
        {topBar}
        <SessionStage>
          <Empty description={t('Нет слов для заучивания')} />
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

  return (
    <>
      {topBar}
      <SessionStage gap={session.phase === 'setup' ? SessionStageGap.SM : SessionStageGap.LG}>
        {session.phase === 'setup' && (
          <ClozeSetup
            fitting={session.fitting}
            total={cards.length}
            defaultTypoTolerance={session.typoTolerance}
            onStart={session.start}
          />
        )}

        {session.phase !== 'setup' && session.current && (
          <ClozePrompt
            item={session.current}
            typoTolerance={session.typoTolerance}
            grade={session.phase === 'feedback' ? session.lastGrade : null}
            userInput={session.lastInput}
            correctNote={correctNote}
            onAnswer={session.answer}
            onSkip={session.skip}
            onNext={session.next}
          />
        )}
      </SessionStage>
    </>
  );
};
