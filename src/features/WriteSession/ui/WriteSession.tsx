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
import { useWriteSession } from '../model/hooks/useWriteSession';
import { WriteSetup } from './WriteSetup';
import { WritePrompt } from './WritePrompt';

interface WriteSessionProps {
  cards: Card[];
  /** Ключ колоды для журнала статистики. */
  deckKey: string;
  /** Имя колоды для снапшота в статистике. */
  deckName: string;
  /** Колода, по которой сузить выборку повторений; не задана — берутся все. */
  reviewsDeckUuid?: string;
  /** Название в топбаре: «Колода · Письмо»; направление добавляется после старта. */
  title: string;
  onExit: () => void;
  renderResult: SessionResultRenderer;
}

export const WriteSession: FC<WriteSessionProps> = (props) => {
  const {
    cards, deckKey, deckName, reviewsDeckUuid, title, onExit, renderResult,
  } = props;
  const { t } = useTranslation();
  const { autoSpeak, toggleAutoSpeak } = useAutoSpeak();
  const { speak } = useSpeech();

  const { data: reviews } = useGetCardReviewsQuery(reviewsDeckUuid);
  const session = useWriteSession(cards, reviews, { deckKey, deckName });
  const correctNote = useIntervalNote(session.lastReview?.interval_days);

  // Автоозвучка английского слова при показе фидбэка
  const spokenTerm = session.phase === 'feedback' ? session.currentCard?.term : undefined;
  useEffect(() => {
    if (spokenTerm && autoSpeak) speak(spokenTerm, 'en-US');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spokenTerm, session.answers.length]);

  const finished = session.phase === 'finished';
  const summary = useMemo(
    () => (finished ? summarizeSession(session.answers, session.startedAt) : null),
    [finished, session.answers, session.startedAt],
  );

  const started = session.phase !== 'setup';
  const direction = session.settings.direction === 'ru-en' ? 'RU → EN' : 'EN → RU';

  const topBar = (
    <SessionTopBar
      title={started ? `${title} ${direction}` : title}
      counter={`${started ? session.done : 0} / ${session.total}`}
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
          <Empty description={t('Нет слов для письма')} />
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
      <SessionStage gap={session.phase === 'setup' ? SessionStageGap.SM : SessionStageGap.MD}>
        {session.phase === 'setup' && (
          <WriteSetup defaults={session.settings} onStart={session.start} />
        )}

        {started && session.currentCard && (
          <WritePrompt
            card={session.currentCard}
            prompt={session.prompt}
            expected={session.expected}
            direction={session.settings.direction}
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
