import {
  useCallback, useEffect, useMemo, useReducer, useRef, useState,
} from 'react';
import {
  Card,
  CardReview,
  applyReview,
  gradeFromAnswer,
  MASTERED_LEVEL,
  levelOf,
  useSaveCardReviewsMutation,
} from '@/entities/Card';
import { StudyEventDraft, useLogStudyEventsMutation } from '@/entities/Statistics';
import { SessionAnswer } from '@/shared/lib/session';
import { AnswerGrade, checkAnswer } from '@/shared/lib/text';
import { randomUUID } from '@/shared/lib/utils';
import {
  buildQueue,
  expectedFor,
  promptFor,
  statsMode,
  WriteSettings,
} from '../lib/writeEngine';

type Phase = 'setup' | 'question' | 'feedback' | 'finished';

/** Сколько ответов копим, прежде чем сбросить пачку на сервер. */
const FLUSH_EVERY = 10;

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
  | { type: 'ACCEPT' }
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
    case 'ACCEPT': {
      // «Я ответил верно»: неверный/почти верный ответ засчитывается как верный, карточка уходит
      if (state.phase !== 'feedback' || state.lastGrade === null || state.lastGrade === 'correct') return state;
      const counters = {
        almost: state.counters.almost - (state.lastGrade === 'almost' ? 1 : 0),
        wrong: state.counters.wrong - (state.lastGrade === 'wrong' ? 1 : 0),
      };
      const queue = state.queue.slice(1);
      return {
        ...state,
        queue,
        counters,
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

export const useWriteSession = (
  cards: Card[],
  savedReviews: CardReview[] | undefined,
  meta: SessionMeta,
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const currentCard = useMemo(
    () => cards.find((c) => c.uuid === state.queue[0]),
    [cards, state.queue],
  );

  const prompt = currentCard ? promptFor(currentCard, state.settings.direction) : '';
  const expected = currentCard ? expectedFor(currentCard, state.settings.direction) : '';

  // Статистика и состояние повторений копятся в буферах и уходят батчами.
  const [logEvents] = useLogStudyEventsMutation();
  const [saveReviews] = useSaveCardReviewsMutation();
  const eventsRef = useRef<StudyEventDraft[]>([]);
  const reviewsRef = useRef<CardReview[]>([]);
  const questionStartRef = useRef(0);
  // Состояние повторения до последнего ответа — для переоценки «Я ответил верно»
  const lastBeforeRef = useRef<CardReview | null>(null);
  // Сессия для статистики — сколько раз садились заниматься
  const sessionIdRef = useRef(randomUUID());

  // Актуальное состояние повторения по карточкам сессии; обновляется на каждый ответ.
  const reviewsByUuid = useRef(new Map<string, CardReview | null>());
  useEffect(() => {
    reviewsByUuid.current = new Map(
      cards.map((card) => [
        card.uuid,
        savedReviews?.find((review) => review.card_uuid === card.uuid) ?? null,
      ]),
    );
  }, [cards, savedReviews]);

  // Засекаем момент показа нового вопроса — для duration_ms.
  useEffect(() => {
    if (state.phase === 'question' && currentCard) {
      questionStartRef.current = performance.now();
    }
  }, [state.phase, currentCard]);

  const flushEvents = useCallback(() => {
    if (eventsRef.current.length > 0) {
      const events = eventsRef.current;
      eventsRef.current = [];
      logEvents({ deckKey: meta.deckKey, deckName: meta.deckName, events });
    }
    if (reviewsRef.current.length > 0) {
      const reviews = reviewsRef.current;
      reviewsRef.current = [];
      saveReviews(reviews);
    }
  }, [logEvents, saveReviews, meta.deckKey, meta.deckName]);

  // Отправляем накопленное при завершении сессии и при уходе со страницы.
  useEffect(() => {
    if (state.phase === 'finished') flushEvents();
  }, [state.phase, flushEvents]);

  useEffect(() => () => flushEvents(), [flushEvents]);

  // Журнал ответов — только для топбара и итога, на логику сессии не влияет.
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [lastReview, setLastReview] = useState<CardReview | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const clearLog = () => {
    setAnswers([]);
    setLastReview(null);
    setStartedAt(Date.now());
    sessionIdRef.current = randomUUID();
  };

  const start = (settings: WriteSettings) => {
    clearLog();
    dispatch({ type: 'START', settings, queue: buildQueue(cards) });
  };

  const answer = (input: string) => {
    if (!currentCard) return;
    const uuid = currentCard.uuid;
    const grade = checkAnswer(expected, input, state.settings.typoTolerance);
    const before = reviewsByUuid.current.get(uuid) ?? null;
    lastBeforeRef.current = before;
    const review = applyReview(before, uuid, gradeFromAnswer(grade));
    reviewsByUuid.current.set(uuid, review);

    eventsRef.current.push({
      card_id: uuid,
      is_correct: grade !== 'wrong',
      level_before: levelOf(before),
      level_after: review.level,
      mode: statsMode(state.settings.direction),
      duration_ms: Math.round(performance.now() - questionStartRef.current),
      session_id: sessionIdRef.current,
    });
    reviewsRef.current.push(review);
    setAnswers((prev) => [...prev, {
      cardUuid: uuid,
      correct: grade !== 'wrong',
      almost: grade === 'almost',
      mastered: grade !== 'wrong' && review.level >= MASTERED_LEVEL,
    }]);
    setLastReview(review);

    dispatch({ type: 'ANSWER', grade, input });
  };

  const skip = () => dispatch({ type: 'SKIP' });
  // Пачку отправляем при переходе дальше, а не при ответе: до этого ответ ещё можно переоценить
  const flushIfFull = () => {
    if (eventsRef.current.length >= FLUSH_EVERY) flushEvents();
  };
  const next = () => {
    flushIfFull();
    dispatch({ type: 'NEXT' });
  };

  /** «Я ответил верно»: заменяет последний ответ (ещё в буфере) на верный и идёт дальше */
  const acceptAsCorrect = () => {
    if (!currentCard || state.phase !== 'feedback' || state.lastGrade === 'correct') return;
    const uuid = currentCard.uuid;
    const review = applyReview(lastBeforeRef.current, uuid, gradeFromAnswer('correct'));
    reviewsByUuid.current.set(uuid, review);

    const lastEvent = eventsRef.current[eventsRef.current.length - 1];
    if (lastEvent?.card_id === uuid) {
      eventsRef.current[eventsRef.current.length - 1] = {
        ...lastEvent, is_correct: true, level_after: review.level,
      };
    }
    if (reviewsRef.current[reviewsRef.current.length - 1]?.card_uuid === uuid) {
      reviewsRef.current[reviewsRef.current.length - 1] = review;
    }
    setAnswers((prev) => [...prev.slice(0, -1), {
      cardUuid: uuid,
      correct: true,
      almost: false,
      mastered: review.level >= MASTERED_LEVEL,
    }]);
    setLastReview(review);

    flushIfFull();
    dispatch({ type: 'ACCEPT' });
  };
  const reset = () => {
    clearLog();
    dispatch({ type: 'RESET' });
  };

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
    answers,
    lastReview,
    startedAt,
    total: cards.length,
    start,
    answer,
    skip,
    next,
    acceptAsCorrect,
    reset,
  };
};
