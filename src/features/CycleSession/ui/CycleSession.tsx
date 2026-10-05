import { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import { CycleWord } from '@/entities/LearningCycle';
import { SessionStage, SessionStageGap } from '@/shared/ui/SessionStage';
import { SessionTopBar } from '@/shared/ui/SessionTopBar';
import {
  buildSessionTicks,
  SessionResultRenderer,
  summarizeSession,
} from '@/shared/lib/session';
import { EmptyState, EmptyStateAlign } from '@/shared/ui/EmptyState';
import { useCycleSession } from '../model/hooks/useCycleSession';
import { CyclePrompt } from './CyclePrompt';

interface CycleSessionProps {
  /** Слова сессии в порядке цикла. */
  words: CycleWord[];
  /** Ключ localStorage для восстановления незаконченной сессии. */
  storageKey: string;
  /** Название в топбаре: «Цикл · Новые слова». */
  title: string;
  onExit: () => void;
  /** Сессия пройдена до конца — оба прохода. */
  onFinish?: () => void;
  renderResult: SessionResultRenderer;
}

export const CycleSession: FC<CycleSessionProps> = (props) => {
  const {
    words, storageKey, title, onExit, onFinish, renderResult,
  } = props;
  const { t } = useTranslation();
  const session = useCycleSession(words, storageKey);

  const finished = session.phase === 'finished';
  useEffect(() => {
    if (finished && words.length) onFinish?.();
    // Только на переход в «пройдено»: новый onFinish на каждом рендере не должен звать его снова
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);
  // Ошибки до перезагрузки страницы журнал не видел — добираем их из состояния цикла
  const summary = useMemo(() => {
    if (!finished) return null;
    const base = summarizeSession(session.answers, session.startedAt);
    const hardUuids = Array.from(new Set([
      ...session.mistakeWords.map((word) => word.uuid),
      ...base.hardUuids,
    ]));
    return { ...base, hardUuids };
  }, [finished, session.answers, session.startedAt, session.mistakeWords]);

  const topBar = (
    <SessionTopBar
      title={title}
      counter={`${t('Проход {{pass}} из {{passes}}', {
        pass: Math.min(session.pass + 1, session.passesCount), passes: session.passesCount,
      })} · ${session.direction === 'en-ru' ? 'EN → RU' : 'RU → EN'} · ${session.done} / ${session.total}`}
      ticks={buildSessionTicks(session.answers, session.phase === 'question')}
      onExit={onExit}
    />
  );

  if (!words.length) {
    return (
      <>
        {topBar}
        <SessionStage>
          <EmptyState icon={Inbox} kicker={t('Цикл')} title={t('Нет слов для заучивания')} align={EmptyStateAlign.CENTER} />
        </SessionStage>
      </>
    );
  }

  if (summary) {
    return (
      <>
        {topBar}
        {renderResult(summary, session.restart)}
      </>
    );
  }

  return (
    <>
      {topBar}
      <SessionStage gap={SessionStageGap.MD}>
        {session.currentWord && (
          <CyclePrompt
            questionKey={session.currentWord.uuid}
            prompt={session.prompt}
            expected={session.expected}
            term={session.currentWord.term}
            direction={session.direction}
            grade={session.phase === 'feedback' ? session.lastGrade : null}
            userInput={session.lastInput}
            onAnswer={session.answer}
            onNext={session.next}
          />
        )}
      </SessionStage>
    </>
  );
};
