import {
  useCallback, useEffect, useMemo, useReducer, useRef, useState,
} from 'react';
import {
  Card,
  CardReview,
  LEARNING_STEPS,
  applyReview,
  gradeFromAnswer,
  levelOf,
  useSaveCardReviewsMutation,
} from '@/entities/Card';
import { StudyEventDraft, useLogStudyEventsMutation } from '@/entities/Statistics';
import { SessionAnswer } from '@/shared/lib/session';
import { randomUUID } from '@/shared/lib/utils';
import {
  buildQuestion,
  buildRoundQueue,
  gradeAnswer,
  initSteps,
  isFinished,
  SessionSteps,
} from '../lib/learnEngine';
import {
  clearStoredSteps,
  drainOutbox,
  pushToOutbox,
  readStoredSteps,
  writeStoredSteps,
} from '../lib/sessionPersistence';

type Phase = 'question' | 'feedback' | 'finished';

/** Сколько ответов копим, прежде чем сбросить пачку на сервер. */
const FLUSH_EVERY = 10;

type Reviews = Record<string, CardReview | null>;

interface SessionState {
  steps: SessionSteps;
  /** Актуальное состояние повторения по карточкам (null — карточка ещё не изучалась). */
  reviews: Reviews;
  queue: string[]; // uuid'ы карточек, оставшиеся в текущем раунде
  round: number;
  phase: Phase;
  lastCorrect: boolean | null;
  lastInput: string;
}

type Action =
  | { type: 'ANSWER'; cardUuid: string; correct: boolean; input: string; review: CardReview | null }
  | { type: 'NEXT' }
  | { type: 'PRUNE' }
  | { type: 'RESET' };

interface InitArg {
  cards: Card[];
  savedReviews?: CardReview[];
  /** Ключ для восстановления шагов сессии из localStorage; RESET его не передаёт. */
  deckKey?: string;
}

const toReviewMap = (cards: Card[], saved?: CardReview[]): Reviews => {
  const byUuid = new Map((saved ?? []).map((review) => [review.card_uuid, review]));
  const result: Reviews = {};
  cards.forEach((card) => {
    result[card.uuid] = byUuid.get(card.uuid) ?? null;
  });
  return result;
};

const createInitialState = ({ cards, savedReviews, deckKey }: InitArg): SessionState => {
  const steps = initSteps(cards, savedReviews);
  // Перезагрузка страницы не должна откатывать шаги текущей сессии:
  // сохранённый в localStorage шаг важнее выведенного из card_reviews.
  const stored = deckKey ? readStoredSteps(deckKey) : null;
  if (stored) {
    cards.forEach((card) => {
      const step = stored[card.uuid];
      if (step !== undefined) steps[card.uuid] = step;
    });
  }
  const finished = isFinished(cards, steps);
  return {
    steps,
    reviews: toReviewMap(cards, savedReviews),
    queue: finished ? [] : buildRoundQueue(cards, steps),
    round: 1,
    phase: finished ? 'finished' : 'question',
    lastCorrect: null,
    lastInput: '',
  };
};

const makeReducer = (cards: Card[]) => (state: SessionState, action: Action): SessionState => {
  switch (action.type) {
    case 'ANSWER': {
      const step = state.steps[action.cardUuid] ?? 0;
      return {
        ...state,
        // Верно — шаг вперёд; ошибка — обратно в начало обучения этой карточки.
        steps: { ...state.steps, [action.cardUuid]: action.correct ? step + 1 : 0 },
        reviews: action.review
          ? { ...state.reviews, [action.cardUuid]: action.review }
          : state.reviews,
        phase: 'feedback',
        lastCorrect: action.correct,
        lastInput: action.input,
      };
    }
    case 'NEXT': {
      // Верно — убираем карточку из очереди; неверно — переносим в конец (повтор в этом раунде).
      let queue: string[];
      if (state.queue.length === 0) {
        queue = [];
      } else {
        const [head, ...rest] = state.queue;
        queue = state.lastCorrect ? rest : [...rest, head];
      }
      let { round } = state;
      const phase: Phase = 'question';

      if (queue.length === 0) {
        if (isFinished(cards, state.steps)) {
          return { ...state, queue: [], phase: 'finished', lastCorrect: null };
        }
        queue = buildRoundQueue(cards, state.steps);
        round += 1;
      }

      return {
        ...state, queue, round, phase, lastCorrect: null, lastInput: '',
      };
    }
    case 'PRUNE': {
      // Выборка карточек могла обновиться (рефетч из-за инвалидации кэша) —
      // выбрасываем из очереди uuid'ы, которых больше нет среди cards, иначе
      // текущий вопрос строился бы по несуществующей карточке (пустой экран).
      const uuids = new Set(cards.map((card) => card.uuid));
      const queue = state.queue.filter((uuid) => uuids.has(uuid));
      if (queue.length > 0) return { ...state, queue };
      if (isFinished(cards, state.steps)) {
        return { ...state, queue: [], phase: 'finished', lastCorrect: null };
      }
      return {
        ...state,
        queue: buildRoundQueue(cards, state.steps),
        round: state.round + 1,
        phase: 'question',
        lastCorrect: null,
        lastInput: '',
      };
    }
    case 'RESET':
      return createInitialState({ cards });
    default:
      return state;
  }
};

interface SessionMeta {
  /** Ключ журнала статистики: deck_uuid или синтетический ключ избранного/всех слов. */
  deckKey: string;
  /** Имя колоды для снапшота в журнале событий. */
  deckName: string;
}

export const useLearnSession = (
  cards: Card[],
  savedReviews: CardReview[] | undefined,
  meta: SessionMeta,
) => {
  const reducer = useMemo(() => makeReducer(cards), [cards]);
  const [state, dispatch] = useReducer(
    reducer,
    { cards, savedReviews, deckKey: meta.deckKey },
    createInitialState,
  );

  const currentCard = useMemo(
    () => cards.find((c) => c.uuid === state.queue[0]),
    [cards, state.queue],
  );

  // Самовосстановление после смены набора карточек (см. PRUNE).
  const cardUuids = useMemo(() => new Set(cards.map((c) => c.uuid)), [cards]);
  useEffect(() => {
    if (state.queue.some((uuid) => !cardUuids.has(uuid))) dispatch({ type: 'PRUNE' });
  }, [state.queue, cardUuids]);

  const question = useMemo(
    () => (currentCard ? buildQuestion(currentCard, cards, state.steps) : null),
    [currentCard, cards, state.steps],
  );

  // Статистика и состояние повторений копятся в буферах и уходят батчами.
  const [logEvents] = useLogStudyEventsMutation();
  const [saveReviews] = useSaveCardReviewsMutation();
  const eventsRef = useRef<StudyEventDraft[]>([]);
  const reviewsRef = useRef<CardReview[]>([]);
  const questionStartRef = useRef(0);
  // Сессия для статистики — сколько раз садились заниматься
  const sessionIdRef = useRef(randomUUID());

  // Засекаем момент показа нового вопроса — для duration_ms.
  useEffect(() => {
    if (state.phase === 'question' && currentCard) {
      questionStartRef.current = performance.now();
    }
  }, [state.phase, currentCard]);

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

  // Отправляем накопленное при завершении колоды и при уходе со страницы.
  useEffect(() => {
    if (state.phase === 'finished') flush();
  }, [state.phase, flush]);

  useEffect(() => () => flush(), [flush]);

  // Зеркалим шаги сессии в localStorage; по завершении запись удаляем,
  // чтобы следующий заход начал новую сессию от card_reviews.
  useEffect(() => {
    if (state.phase === 'finished') {
      clearStoredSteps(meta.deckKey);
    } else {
      writeStoredSteps(meta.deckKey, state.steps);
    }
  }, [state.steps, state.phase, meta.deckKey]);

  // Доотправляем пачки, не успевшие уйти при прошлом закрытии/перезагрузке страницы.
  useEffect(() => {
    drainOutbox().forEach((entry) => {
      if (entry.events.length > 0) {
        logEvents({ deckKey: entry.deckKey, deckName: entry.deckName, events: entry.events });
      }
      if (entry.reviews.length > 0) saveReviews(entry.reviews);
    });
  }, [logEvents, saveReviews]);

  // При жёсткой перезагрузке/закрытии вкладки React не размонтирует компонент,
  // а сетевой запрос при выгрузке страницы может не дойти — буфер синхронно
  // уходит в outbox и доотправится при следующем открытии режима.
  useEffect(() => {
    const persistPending = () => {
      if (eventsRef.current.length === 0 && reviewsRef.current.length === 0) return;
      pushToOutbox({
        deckKey: meta.deckKey,
        deckName: meta.deckName,
        events: eventsRef.current,
        reviews: reviewsRef.current,
      });
      eventsRef.current = [];
      reviewsRef.current = [];
    };
    window.addEventListener('pagehide', persistPending);
    return () => window.removeEventListener('pagehide', persistPending);
  }, [meta.deckKey, meta.deckName]);

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

  const answer = (input: string) => {
    if (!currentCard) return;
    const uuid = currentCard.uuid;
    const before = state.reviews[uuid] ?? null;
    const correct = gradeAnswer(currentCard, input);
    const nextStep = correct ? (state.steps[uuid] ?? 0) + 1 : 0;

    // В card_reviews пишем только на выпуске карточки и на ошибке:
    // промежуточный шаг обучения — состояние сессии, а не долговременной памяти.
    const graduated = correct && nextStep >= LEARNING_STEPS;
    const review = (graduated || !correct)
      ? applyReview(before, uuid, gradeFromAnswer(correct))
      : null;

    eventsRef.current.push({
      card_id: uuid,
      is_correct: correct,
      level_before: levelOf(before),
      level_after: review ? review.level : levelOf(before),
      mode: question?.type ?? 'choice',
      duration_ms: Math.round(performance.now() - questionStartRef.current),
      session_id: sessionIdRef.current,
    });
    if (review) reviewsRef.current.push(review);
    if (eventsRef.current.length >= FLUSH_EVERY) flush();
    // «Усвоено» в итоге — карточка прошла все шаги обучения в этой сессии
    setAnswers((prev) => [...prev, { cardUuid: uuid, correct, mastered: graduated }]);
    setLastReview(review);

    dispatch({
      type: 'ANSWER', cardUuid: uuid, correct, input, review,
    });
  };

  const next = () => dispatch({ type: 'NEXT' });
  const reset = () => {
    clearLog();
    dispatch({ type: 'RESET' });
  };

  return {
    phase: state.phase,
    round: state.round,
    reviews: state.reviews,
    steps: state.steps,
    question,
    lastCorrect: state.lastCorrect,
    lastInput: state.lastInput,
    total: cards.length,
    answers,
    lastReview,
    startedAt,
    answer,
    next,
    reset,
  };
};
