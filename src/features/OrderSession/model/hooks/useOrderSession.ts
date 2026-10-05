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
import { OrderItem, buildOrderItems, isOrderCorrect } from '../lib/orderEngine';

type Phase = 'question' | 'feedback' | 'finished';

/** Сколько ответов копим, прежде чем сбросить пачку на сервер. */
const FLUSH_EVERY = 10;

interface OrderState {
  phase: Phase;
  queue: OrderItem[];
  /** Слова, уже перенесённые в строку ответа. */
  answer: string[];
  lastCorrect: boolean | null;
  wrong: number;
  total: number;
}

type Action =
  | { type: 'PICK'; index: number }
  | { type: 'UNPICK'; index: number }
  | { type: 'CHECK'; correct: boolean }
  | { type: 'NEXT' }
  | { type: 'RESET'; queue: OrderItem[] };

const makeInitialState = (queue: OrderItem[]): OrderState => ({
  phase: queue.length > 0 ? 'question' : 'finished',
  queue,
  answer: [],
  lastCorrect: null,
  wrong: 0,
  total: queue.length,
});

const reducer = (state: OrderState, action: Action): OrderState => {
  switch (action.type) {
    case 'PICK': {
      if (state.phase !== 'question') return state;
      const item = state.queue[0];
      if (!item) return state;
      // Индекс относится к «банку» — оставшимся невыбранным словам.
      const remaining = remainingBank(item, state.answer);
      const word = remaining[action.index];
      if (word === undefined) return state;
      return { ...state, answer: [...state.answer, word] };
    }
    case 'UNPICK': {
      if (state.phase !== 'question') return state;
      return { ...state, answer: state.answer.filter((_, i) => i !== action.index) };
    }
    case 'CHECK': {
      if (state.phase !== 'question') return state;
      return {
        ...state,
        phase: 'feedback',
        lastCorrect: action.correct,
        wrong: state.wrong + (action.correct ? 0 : 1),
      };
    }
    case 'NEXT': {
      if (state.phase !== 'feedback') return state;
      // Верно — карточка уходит; неверно — в конец очереди.
      const [head, ...rest] = state.queue;
      const queue = state.lastCorrect ? rest : [...rest, head];
      return {
        ...state,
        queue,
        answer: [],
        lastCorrect: null,
        phase: queue.length === 0 ? 'finished' : 'question',
      };
    }
    case 'RESET':
      return makeInitialState(action.queue);
    default:
      return state;
  }
};

/** Слова банка, ещё не перенесённые в ответ (с учётом повторов). */
export const remainingBank = (item: OrderItem, answer: string[]): string[] => {
  const used = [...answer];
  return item.bank.filter((word) => {
    const at = used.indexOf(word);
    if (at === -1) return true;
    used.splice(at, 1);
    return false;
  });
};

interface SessionMeta {
  /** Ключ колоды для журнала статистики. */
  deckKey: string;
  /** Имя колоды для снапшота в журнале событий. */
  deckName: string;
}

export const useOrderSession = (
  cards: Card[],
  savedReviews: CardReview[] | undefined,
  meta: SessionMeta,
) => {
  const items = useMemo(() => buildOrderItems(cards), [cards]);
  const [state, dispatch] = useReducer(reducer, items, makeInitialState);

  const current = state.queue[0] ?? null;
  const bank = current ? remainingBank(current, state.answer) : [];

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

  const check = () => {
    if (!current) return;
    const uuid = current.card.uuid;
    const correct = isOrderCorrect(current.card, state.answer);
    const before = reviewsByUuid.current.get(uuid) ?? null;
    const review = applyReview(before, uuid, gradeFromAnswer(correct));
    reviewsByUuid.current.set(uuid, review);

    eventsRef.current.push({
      card_id: uuid,
      is_correct: correct,
      level_before: levelOf(before),
      level_after: review.level,
      mode: 'order',
      duration_ms: Math.round(performance.now() - questionStartRef.current),
      session_id: sessionIdRef.current,
    });
    reviewsRef.current.push(review);
    if (eventsRef.current.length >= FLUSH_EVERY) flush();
    setAnswers((prev) => [...prev, { cardUuid: uuid, correct, mastered: correct && review.level >= MASTERED_LEVEL }]);
    setLastReview(review);

    dispatch({ type: 'CHECK', correct });
  };

  return {
    phase: state.phase,
    current,
    bank,
    answer: state.answer,
    lastCorrect: state.lastCorrect,
    wrong: state.wrong,
    done: state.total - state.queue.length,
    total: state.total,
    answers,
    lastReview,
    startedAt,
    pick: (index: number) => dispatch({ type: 'PICK', index }),
    unpick: (index: number) => dispatch({ type: 'UNPICK', index }),
    check,
    next: () => dispatch({ type: 'NEXT' }),
    reset: () => {
      clearLog();
      dispatch({ type: 'RESET', queue: buildOrderItems(cards) });
    },
  };
};
