import { CycleWord } from '@/entities/LearningCycle';
import { AnswerGrade } from '@/shared/lib/text';

/**
 * Сессия цикла заучивания: весь список пишется EN→RU, затем весь список RU→EN.
 * Порядок — порядок цикла; неверно отвеченное слово уходит в конец текущего
 * прохода и спрашивается, пока не будет написано верно.
 */

export type CycleDirection = 'en-ru' | 'ru-en';

/** Проходы сессии по порядку. */
export const PASSES: readonly CycleDirection[] = ['en-ru', 'ru-en'];

export type CyclePhase = 'question' | 'feedback' | 'finished';

export interface CycleSessionState {
  phase: CyclePhase;
  /** Индекс текущего прохода в PASSES. */
  pass: number;
  /** Uuid'ы слов сессии в порядке цикла — основа очереди каждого прохода. */
  order: string[];
  /** Слова текущего прохода, ещё не написанные верно; голова — текущий вопрос. */
  queue: string[];
  lastGrade: AnswerGrade | null;
  lastInput: string;
  /** Слова, в которых была хотя бы одна ошибка (без повторов). */
  mistakes: string[];
  wrongCount: number;
}

export type CycleAction =
  | { type: 'ANSWER'; grade: AnswerGrade; input: string }
  | { type: 'NEXT' }
  | { type: 'RESTART'; order: string[] };

/** Тот же ли набор слов в том же порядке. */
export const sameOrder = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((uuid, i) => uuid === b[i]);

export const createSessionState = (order: string[]): CycleSessionState => ({
  phase: order.length > 0 ? 'question' : 'finished',
  pass: 0,
  order,
  queue: order,
  lastGrade: null,
  lastInput: '',
  mistakes: [],
  wrongCount: 0,
});

export const cycleReducer = (state: CycleSessionState, action: CycleAction): CycleSessionState => {
  switch (action.type) {
    case 'ANSWER': {
      if (state.phase !== 'question') return state;
      const isWrong = action.grade === 'wrong';
      const head = state.queue[0];
      return {
        ...state,
        phase: 'feedback',
        lastGrade: action.grade,
        lastInput: action.input,
        wrongCount: state.wrongCount + (isWrong ? 1 : 0),
        mistakes: isWrong && !state.mistakes.includes(head) ? [...state.mistakes, head] : state.mistakes,
      };
    }
    case 'NEXT': {
      if (state.phase !== 'feedback') return state;
      const [head, ...rest] = state.queue;
      const queue = state.lastGrade === 'wrong' ? [...rest, head] : rest;
      const base = { ...state, lastGrade: null, lastInput: '' };
      if (queue.length > 0) return { ...base, queue, phase: 'question' };
      // Проход закончен — следующий направлением наоборот, либо финиш.
      const pass = state.pass + 1;
      if (pass < PASSES.length) return { ...base, pass, queue: state.order, phase: 'question' };
      return { ...base, queue: [], phase: 'finished' };
    }
    case 'RESTART':
      return createSessionState(action.order);
    default:
      return state;
  }
};

/** Что показываем пользователю в вопросе. */
export const promptFor = (word: CycleWord, direction: CycleDirection): string =>
  (direction === 'en-ru' ? word.term : word.translation);

/** Что должен написать пользователь. */
export const expectedFor = (word: CycleWord, direction: CycleDirection): string =>
  (direction === 'en-ru' ? word.translation : word.term);
