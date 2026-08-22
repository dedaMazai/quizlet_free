import {
  useCallback, useEffect, useMemo, useReducer, useRef,
} from 'react';
import { Card } from '@/entities/Card';
import { StudyEventDraft, useLogStudyEventsMutation } from '@/entities/Statistics';
import {
  AnswerGrade,
  buildQueue,
  checkAnswer,
  expectedFor,
  promptFor,
  statsMode,
  WriteSettings,
} from '../lib/writeEngine';

type Phase = 'setup' | 'question' | 'feedback' | 'finished';

interface WriteState {
  phase: Phase;
  settings: WriteSettings;
  queue: string[]; // uuid'ы карточек, ещё не написанных верно
  lastGrade: AnswerGrade | null;
  lastInput: string;
  counters: { almost: number; wrong: number };
}

type Action =
  | { type: 'START'; settings: WriteSettings; queue: string[] }
  | { type: 'ANSWER'; grade: AnswerGrade; input: string }
  | { type: 'SKIP' }
  | { type: 'NEXT' }
  | { type: 'RESET' };

const initialState: WriteState = {
  phase: 'setup',
  settings: { direction: 'ru-en', typoTolerance: true },
  queue: [],
  lastGrade: null,
  lastInput: '',
  counters: { almost: 0, wrong: 0 },
};

const reducer = (state: WriteState, action: Action): WriteState => {
  switch (action.type) {
    case 'START':
      return {
        ...initialState,
        settings: action.settings,
        queue: action.queue,
        phase: action.queue.length > 0 ? 'question' : 'finished',
      };
    case 'ANSWER': {
      if (state.phase !== 'question') return state;
      const counters = {
        almost: state.counters.almost + (action.grade === 'almost' ? 1 : 0),
        wrong: state.counters.wrong + (action.grade === 'wrong' ? 1 : 0),
      };
      return {
        ...state, phase: 'feedback', lastGrade: action.grade, lastInput: action.input, counters,
      };
    }
    case 'SKIP': {
      // Переносим текущую карточку в конец очереди без штрафа и фидбэка.
      if (state.phase !== 'question' || state.queue.length <= 1) return state;
      const [head, ...rest] = state.queue;
      return { ...state, queue: [...rest, head] };
    }
    case 'NEXT': {
      if (state.phase !== 'feedback') return state;
      // Верно/почти верно — карточка уходит; неверно — в конец очереди.
      const [head, ...rest] = state.queue;
      const queue = state.lastGrade === 'wrong' ? [...rest, head] : rest;
      return {
        ...state,
        queue,
        phase: queue.length === 0 ? 'finished' : 'question',
        lastGrade: null,
        lastInput: '',
      };
    }
    case 'RESET':
      // Возврат на экран настроек с сохранением выбранных настроек.
      return { ...initialState, settings: state.settings };
    default:
      return state;
  }
};

interface SessionMeta {
  /** Ключ колоды для журнала статистики. */
  deckKey: string;
  /** Имя колоды для снапшота в журнале событий. */
  deckName: string;
}

export const useWriteSession = (cards: Card[], meta: SessionMeta) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const currentCard = useMemo(
    () => cards.find((c) => c.uuid === state.queue[0]),
    [cards, state.queue],
  );

  const prompt = currentCard ? promptFor(currentCard, state.settings.direction) : '';
  const expected = currentCard ? expectedFor(currentCard, state.settings.direction) : '';

  // Логирование статистики: копим события в буфере и отправляем батчем при flush.
  const [logEvents] = useLogStudyEventsMutation();
  const eventsRef = useRef<StudyEventDraft[]>([]);
  const questionStartRef = useRef(0);

  // Засекаем момент показа нового вопроса — для duration_ms.
  useEffect(() => {
    if (state.phase === 'question' && currentCard) {
      questionStartRef.current = performance.now();
    }
  }, [state.phase, currentCard]);

  const flushEvents = useCallback(() => {
    if (eventsRef.current.length === 0) return;
    const events = eventsRef.current;
    eventsRef.current = [];
    logEvents({ deckKey: meta.deckKey, deckName: meta.deckName, events });
  }, [logEvents, meta.deckKey, meta.deckName]);

  // Отправляем накопленное при завершении сессии и при уходе со страницы.
  useEffect(() => {
    if (state.phase === 'finished') flushEvents();
  }, [state.phase, flushEvents]);

  useEffect(() => () => flushEvents(), [flushEvents]);

  const start = (settings: WriteSettings) =>
    dispatch({ type: 'START', settings, queue: buildQueue(cards) });

  const answer = (input: string) => {
    if (!currentCard) return;
    const grade = checkAnswer(expected, input, state.settings.typoTolerance);
    eventsRef.current.push({
      card_id: currentCard.uuid,
      is_correct: grade !== 'wrong',
      level_before: 0,
      level_after: 0,
      mode: statsMode(state.settings.direction),
      duration_ms: Math.round(performance.now() - questionStartRef.current),
    });
    dispatch({ type: 'ANSWER', grade, input });
  };

  const skip = () => dispatch({ type: 'SKIP' });
  const next = () => dispatch({ type: 'NEXT' });
  const reset = () => dispatch({ type: 'RESET' });

  return {
    phase: state.phase,
    settings: state.settings,
    currentCard,
    prompt,
    expected,
    lastGrade: state.lastGrade,
    lastInput: state.lastInput,
    counters: state.counters,
    done: cards.length - state.queue.length,
    total: cards.length,
    start,
    answer,
    skip,
    next,
    reset,
  };
};
