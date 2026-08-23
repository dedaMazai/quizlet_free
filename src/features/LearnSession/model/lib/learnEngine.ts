import { Card, CardReview, LEARNING_STEPS } from '@/entities/Card';
import { shuffle } from '@/shared/lib/utils';

export const ROUND_SIZE = 7;
export const CHOICES_COUNT = 4;
// Минимум новых слов, подмешиваемых в раунд, пока они есть (чтобы старые на написании
// и новые на выборе шли вперемешку — поведение Quizlet).
export const FRESH_MIN = 3;

export type QuestionType = 'choice' | 'write';

/**
 * Шаг обучения карточки в рамках ТЕКУЩЕЙ сессии. В БД не сохраняется:
 * долговременное состояние живёт в card_reviews, шаг — только в памяти сессии.
 */
export type SessionSteps = Record<string, number>;

export interface LearnQuestion {
  card: Card;
  type: QuestionType;
  /** Варианты ответа (term'ы) — только для type === 'choice'. */
  choices: string[];
}

/** Первый шаг — выбор из вариантов, дальше — ввод с клавиатуры. */
export const questionTypeForStep = (step: number): QuestionType =>
  (step === 0 ? 'choice' : 'write');

/** Нормализация ответа для сравнения. */
const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

/** Сравнивает введённый ответ с правильным term. */
export const gradeAnswer = (card: Card, input: string): boolean =>
  normalize(input) === normalize(card.term);

/**
 * Начальные шаги сессии: новая карточка проходит оба шага (выбор → ввод),
 * уже выпущенная попадает сразу на ввод — один верный ответ закрывает её.
 */
export const initSteps = (cards: Card[], reviews?: CardReview[]): SessionSteps => {
  const byUuid = new Map((reviews ?? []).map((review) => [review.card_uuid, review]));
  const result: SessionSteps = {};
  cards.forEach((card) => {
    const review = byUuid.get(card.uuid);
    result[card.uuid] = review && review.reps > 0 ? LEARNING_STEPS - 1 : 0;
  });
  return result;
};

/** Сессия закончена, когда все карточки прошли все шаги обучения. */
export const isFinished = (cards: Card[], steps: SessionSteps): boolean =>
  cards.length > 0 && cards.every((card) => (steps[card.uuid] ?? 0) >= LEARNING_STEPS);

/** Формирует 4 варианта ответа: правильный term + до 3 случайных дистракторов. */
export const buildChoices = (card: Card, allCards: Card[]): string[] => {
  const distractors = shuffle(
    allCards.filter((c) => c.uuid !== card.uuid).map((c) => c.term),
  ).slice(0, CHOICES_COUNT - 1);
  return shuffle([card.term, ...distractors]);
};

/**
 * Выбирает карточки для нового раунда, перемешивая «активные» (в середине обучения,
 * написание) и новые (выбор). Пока есть новые слова, под них резервируется минимум
 * FRESH_MIN слотов — так старые и новые идут вперемешку.
 */
export const selectRoundCards = (cards: Card[], steps: SessionSteps): Card[] => {
  const stepOf = (card: Card) => steps[card.uuid] ?? 0;
  const active = cards.filter((c) => stepOf(c) > 0 && stepOf(c) < LEARNING_STEPS);
  const fresh = cards.filter((c) => stepOf(c) === 0);

  const freshTake = Math.min(fresh.length, Math.max(FRESH_MIN, ROUND_SIZE - active.length));
  const activeTake = Math.min(active.length, ROUND_SIZE - freshTake);

  return [...active.slice(0, activeTake), ...fresh.slice(0, freshTake)];
};

/** Очередь uuid'ов карточек текущего раунда (в перемешанном порядке). */
export const buildRoundQueue = (cards: Card[], steps: SessionSteps): string[] =>
  shuffle(selectRoundCards(cards, steps)).map((c) => c.uuid);

/** Строит вопрос для карточки по её текущему шагу. */
export const buildQuestion = (card: Card, allCards: Card[], steps: SessionSteps): LearnQuestion => {
  const type = questionTypeForStep(steps[card.uuid] ?? 0);
  return {
    card,
    type,
    choices: type === 'choice' ? buildChoices(card, allCards) : [],
  };
};
