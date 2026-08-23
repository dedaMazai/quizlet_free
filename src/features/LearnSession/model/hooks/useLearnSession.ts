import {
  useCallback, useEffect, useMemo, useReducer, useRef,
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
import {
  buildQuestion,
  buildRoundQueue,
  gradeAnswer,
  initSteps,
  isFinished,
  SessionSteps,
} from '../lib/learnEngine';

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
  | { type: 'RESET' };

interface InitArg {
  cards: Card[];
  savedReviews?: CardReview[];
}

const toReviewMap = (cards: Card[], saved?: CardReview[]): Reviews => {
  const byUuid = new Map((saved ?? []).map((review) => [review.card_uuid, review]));
  const result: Reviews = {};
  cards.forEach((card) => {
    result[card.uuid] = byUuid.get(card.uuid) ?? null;
  });
  return result;
};

const createInitialState = ({ cards, savedReviews }: InitArg): SessionState => {
  const steps = initSteps(cards, savedReviews);
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
      const [head, ...rest] = state.queue;
      let queue = state.lastCorrect ? rest : [...rest, head];
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
    { cards, savedReviews },
    createInitialState,
  );

  const currentCard = useMemo(
    () => cards.find((c) => c.uuid === state.queue[0]),
    [cards, state.queue],
  );

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
    });
    if (review) reviewsRef.current.push(review);
    if (eventsRef.current.length >= FLUSH_EVERY) flush();

    dispatch({
      type: 'ANSWER', cardUuid: uuid, correct, input, review,
    });
  };

  const next = () => dispatch({ type: 'NEXT' });
  const reset = () => dispatch({ type: 'RESET' });

  return {
    phase: state.phase,
    round: state.round,
    reviews: state.reviews,
    steps: state.steps,
    question,
    lastCorrect: state.lastCorrect,
    lastInput: state.lastInput,
    total: cards.length,
    answer,
    next,
    reset,
  };
};
