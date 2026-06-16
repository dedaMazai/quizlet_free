import { useMemo, useReducer } from 'react';
import { Card } from '@/entities/Card';
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

export const useLearnSession = (cards: Card[], savedLevels?: Levels) => {
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

  const answer = (input: string) => {
    if (!currentCard) return;
    dispatch({
      type: 'ANSWER',
      cardUuid: currentCard.uuid,
      correct: gradeAnswer(currentCard, input),
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
