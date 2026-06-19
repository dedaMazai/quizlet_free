import {
  useCallback, useEffect, useMemo, useReducer, useRef,
} from 'react';
import { Card } from '@/entities/Card';
import { StudyEventDraft, useLogStudyEventsMutation } from '@/entities/Statistics';
import {
  applyAnswer,
  buildQuestion,
  buildRoundQueue,
  gradeAnswer,
  initLevels,
  isFinished,
  Levels,
  masteredCount,
} from '../lib/learnEngine';

type Phase = 'question' | 'feedback' | 'finished';

interface SessionState {
  levels: Levels;
  queue: string[]; // uuid'ы карточек, оставшиеся в текущем раунде
  round: number;
  phase: Phase;
  lastCorrect: boolean | null;
  lastInput: string;
}

type Action =
  | { type: 'ANSWER'; cardUuid: string; correct: boolean; input: string }
  | { type: 'NEXT' }
  | { type: 'RESET' };

interface InitArg {
  cards: Card[];
  savedLevels?: Levels;
}

const createInitialState = ({ cards, savedLevels }: InitArg): SessionState => {
  const levels = initLevels(cards, savedLevels);
  const finished = isFinished(cards, levels);
  return {
    levels,
    queue: finished ? [] : buildRoundQueue(cards, levels),
    round: 1,
    phase: finished ? 'finished' : 'question',
    lastCorrect: null,
    lastInput: '',
  };
};

const makeReducer = (cards: Card[]) => (state: SessionState, action: Action): SessionState => {
  switch (action.type) {
    case 'ANSWER': {
      const levels = applyAnswer(state.levels, action.cardUuid, action.correct);
      return {
        ...state,
        levels,
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
        if (isFinished(cards, state.levels)) {
          return { ...state, queue: [], phase: 'finished', lastCorrect: null };
        }
        queue = buildRoundQueue(cards, state.levels);
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
  /** Ключ прогресса/статистики: deck_uuid или синтетический ключ избранного/всех слов. */
  deckKey: string;
  /** Имя колоды для снапшота в журнале событий. */
  deckName: string;
}

export const useLearnSession = (cards: Card[], savedLevels: Levels | undefined, meta: SessionMeta) => {
  const reducer = useMemo(() => makeReducer(cards), [cards]);
  const [state, dispatch] = useReducer(
    reducer,
    { cards, savedLevels },
    createInitialState,
  );

  const currentCard = useMemo(
    () => cards.find((c) => c.uuid === state.queue[0]),
    [cards, state.queue],
  );

  const question = useMemo(
    () => (currentCard ? buildQuestion(currentCard, cards, state.levels) : null),
    [currentCard, cards, state.levels],
  );

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

  // Отправляем накопленное при завершении колоды и при уходе со страницы.
  useEffect(() => {
    if (state.phase === 'finished') flushEvents();
  }, [state.phase, flushEvents]);

  useEffect(() => () => flushEvents(), [flushEvents]);

  const answer = (input: string) => {
    if (!currentCard) return;
    const levelBefore = state.levels[currentCard.uuid] ?? 0;
    const correct = gradeAnswer(currentCard, input);
    eventsRef.current.push({
      card_id: currentCard.uuid,
      is_correct: correct,
      level_before: levelBefore,
      level_after: correct ? Math.min(levelBefore + 1, 2) : 0,
      mode: question?.type ?? 'choice',
      duration_ms: Math.round(performance.now() - questionStartRef.current),
    });
    dispatch({
      type: 'ANSWER',
      cardUuid: currentCard.uuid,
      correct,
      input,
    });
  };

  const next = () => dispatch({ type: 'NEXT' });
  const reset = () => dispatch({ type: 'RESET' });

  return {
    phase: state.phase,
    round: state.round,
    levels: state.levels,
    question,
    lastCorrect: state.lastCorrect,
    lastInput: state.lastInput,
    mastered: masteredCount(cards, state.levels),
    total: cards.length,
    answer,
    next,
    reset,
  };
};
