import { useEffect, useMemo, useReducer } from 'react';
import { CycleWord } from '@/entities/LearningCycle';
import { checkAnswerVariants } from '@/shared/lib/text';
import {
  createSessionState,
  cycleReducer,
  expectedFor,
  PASSES,
  promptFor,
  sameOrder,
} from '../lib/cycleEngine';
import { clearStoredSession, readStoredSession, writeStoredSession } from '../lib/sessionPersistence';

export const useCycleSession = (words: CycleWord[], storageKey: string) => {
  const order = useMemo(() => words.map((w) => w.uuid), [words]);

  const [state, dispatch] = useReducer(
    cycleReducer,
    order,
    (initialOrder) => readStoredSession(storageKey, initialOrder) ?? createSessionState(initialOrder),
  );

  // Состав слов поменялся посреди сессии (слово удалили, открыли порцию) —
  // начинаем заново, иначе текущий вопрос может указывать на несуществующее слово.
  useEffect(() => {
    if (!sameOrder(order, state.order)) dispatch({ type: 'RESTART', order });
  }, [order, state.order]);

  useEffect(() => {
    if (state.phase === 'finished') clearStoredSession(storageKey);
    else writeStoredSession(storageKey, state);
  }, [state, storageKey]);

  const byUuid = useMemo(() => new Map(words.map((w) => [w.uuid, w])), [words]);
  const direction = PASSES[state.pass] ?? PASSES[0];
  const currentWord = byUuid.get(state.queue[0]);
  const prompt = currentWord ? promptFor(currentWord, direction) : '';
  const expected = currentWord ? expectedFor(currentWord, direction) : '';

  const answer = (input: string) => {
    if (!currentWord) return;
    dispatch({ type: 'ANSWER', grade: checkAnswerVariants(expected, input, true), input });
  };
  const next = () => dispatch({ type: 'NEXT' });
  const restart = () => dispatch({ type: 'RESTART', order });

  const mistakeWords = useMemo(
    () => state.mistakes.flatMap((uuid) => byUuid.get(uuid) ?? []),
    [state.mistakes, byUuid],
  );

  return {
    phase: state.phase,
    pass: state.pass,
    passesCount: PASSES.length,
    direction,
    currentWord,
    prompt,
    expected,
    lastGrade: state.lastGrade,
    lastInput: state.lastInput,
    wrongCount: state.wrongCount,
    mistakeWords,
    done: state.order.length - state.queue.length,
    total: state.order.length,
    answer,
    next,
    restart,
  };
};
