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
import { AnswerGrade } from '@/shared/lib/text';
import { ClozeItem, buildClozeItems, gradeCloze } from '../lib/clozeEngine';

type Phase = 'setup' | 'question' | 'feedback' | 'finished';

/** Сколько ответов копим, прежде чем сбросить пачку на сервер. */
const FLUSH_EVERY = 10;

interface ClozeState {
  phase: Phase;
  typoTolerance: boolean;
  /** Карточки, ещё не пройденные верно. */
  queue: ClozeItem[];
  lastGrade: AnswerGrade | null;
  lastInput: string;
  counters: { almost: number; wrong: number };
  total: number;
}

type Action =
  | { type: 'START'; typoTolerance: boolean; queue: ClozeItem[] }
  | { type: 'ANSWER'; grade: AnswerGrade; input: string }
  | { type: 'SKIP' }
  | { type: 'NEXT' }
  | { type: 'RESET' };

const initialState: ClozeState = {
  phase: 'setup',
  typoTolerance: true,
  queue: [],
  lastGrade: null,
  lastInput: '',
  counters: { almost: 0, wrong: 0 },
  total: 0,
};

const reducer = (state: ClozeState, action: Action): ClozeState => {
  switch (action.type) {
    case 'START':
      return {
        ...initialState,
        typoTolerance: action.typoTolerance,
        queue: action.queue,
        total: action.queue.length,
        phase: action.queue.length > 0 ? 'question' : 'finished',
      };
    case 'ANSWER': {
      if (state.phase !== 'question') return state;
      return {
        ...state,
        phase: 'feedback',
        lastGrade: action.grade,
        lastInput: action.input,
        counters: {
          almost: state.counters.almost + (action.grade === 'almost' ? 1 : 0),
          wrong: state.counters.wrong + (action.grade === 'wrong' ? 1 : 0),
        },
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
      return { ...initialState, typoTolerance: state.typoTolerance };
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

export const useClozeSession = (
  cards: Card[],
  savedReviews: CardReview[] | undefined,
  meta: SessionMeta,
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const current = state.queue[0] ?? null;

  // Статистика и состояние повторений копятся в буферах и уходят батчами.
  const [logEvents] = useLogStudyEventsMutation();
  const [saveReviews] = useSaveCardReviewsMutation();
  const eventsRef = useRef<StudyEventDraft[]>([]);
  const reviewsRef = useRef<CardReview[]>([]);
  const questionStartRef = useRef(0);
  // Сессия для статистики — сколько раз садились заниматься
  const sessionIdRef = useRef(crypto.randomUUID());

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
    if (state.phase === 'question' && current) {
      questionStartRef.current = performance.now();
    }
  }, [state.phase, current]);

  const flush = useCallback(() => {
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

  useEffect(() => {
    if (state.phase === 'finished') flush();
  }, [state.phase, flush]);

  useEffect(() => () => flush(), [flush]);

  const fittingItems = useMemo(() => buildClozeItems(cards), [cards]);

  // Журнал ответов — только для топбара и итога, на логику сессии не влияет.
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [lastReview, setLastReview] = useState<CardReview | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const clearLog = () => {
    setAnswers([]);
    setLastReview(null);
    setStartedAt(Date.now());
    sessionIdRef.current = crypto.randomUUID();
  };

  const start = (typoTolerance: boolean) => {
    clearLog();
    dispatch({ type: 'START', typoTolerance, queue: fittingItems });
  };

  const answer = (input: string) => {
    if (!current) return;
    const uuid = current.card.uuid;
    const grade = gradeCloze(current.expected, input, state.typoTolerance);
    const before = reviewsByUuid.current.get(uuid) ?? null;
    const review = applyReview(before, uuid, gradeFromAnswer(grade));
    reviewsByUuid.current.set(uuid, review);

    eventsRef.current.push({
      card_id: uuid,
      is_correct: grade !== 'wrong',
      level_before: levelOf(before),
      level_after: review.level,
      mode: 'cloze',
      duration_ms: Math.round(performance.now() - questionStartRef.current),
      session_id: sessionIdRef.current,
    });
    reviewsRef.current.push(review);
    if (eventsRef.current.length >= FLUSH_EVERY) flush();
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
  const next = () => dispatch({ type: 'NEXT' });
  const reset = () => {
    clearLog();
    dispatch({ type: 'RESET' });
  };

  return {
    phase: state.phase,
    typoTolerance: state.typoTolerance,
    current,
    lastGrade: state.lastGrade,
    lastInput: state.lastInput,
    counters: state.counters,
    fitting: fittingItems.length,
    answers,
    lastReview,
    startedAt,
    done: state.total - state.queue.length,
    total: state.total,
    start,
    answer,
    skip,
    next,
    reset,
  };
};
