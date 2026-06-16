import { Card, CardLevel } from '@/entities/Card';
import { shuffle } from '@/shared/lib/utils';

export const ROUND_SIZE = 7;
export const CHOICES_COUNT = 4;
// Минимум новых слов, подмешиваемых в раунд, пока они есть (чтобы старые на написании
// и новые на выборе шли вперемешку — поведение Quizlet).
export const FRESH_MIN = 3;

export type QuestionType = 'choice' | 'write';

export type Levels = Record<string, CardLevel>;

export interface LearnQuestion {
  card: Card;
  type: QuestionType;
  /** Варианты ответа (term'ы) — только для type === 'choice'. */
  choices: string[];
}

/** Тип вопроса в зависимости от уровня карточки: 0 → выбор, 1 → написание. */
export const questionTypeForLevel = (level: CardLevel): QuestionType =>
  (level === 0 ? 'choice' : 'write');

/** Нормализация ответа для сравнения. */
const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

/** Сравнивает введённый ответ с правильным term. */
export const gradeAnswer = (card: Card, input: string): boolean =>
  normalize(input) === normalize(card.term);

/**
 * Инициализирует карту уровней: берёт сохранённые значения для существующих
 * карточек, остальным ставит 0. Удалённые карточки отбрасываются.
 */
export const initLevels = (cards: Card[], saved?: Levels): Levels => {
  const result: Levels = {};
  cards.forEach((card) => {
    result[card.uuid] = saved?.[card.uuid] ?? 0;
  });
  return result;
};

/** Колода выучена, когда все карточки на уровне 2. */
export const isFinished = (cards: Card[], levels: Levels): boolean =>
  cards.length > 0 && cards.every((card) => levels[card.uuid] === 2);

/** Кол-во усвоенных карточек (уровень 2). */
export const masteredCount = (cards: Card[], levels: Levels): number =>
  cards.filter((card) => levels[card.uuid] === 2).length;

/** Формирует 4 варианта ответа: правильный term + до 3 случайных дистракторов. */
export const buildChoices = (card: Card, allCards: Card[]): string[] => {
  const distractors = shuffle(
    allCards.filter((c) => c.uuid !== card.uuid).map((c) => c.term),
  ).slice(0, CHOICES_COUNT - 1);
  return shuffle([card.term, ...distractors]);
};

/**
 * Выбирает карточки для нового раунда, перемешивая «активные» (уровень 1, написание)
 * и новые (уровень 0, выбор). Пока есть новые слова, под них резервируется минимум
 * FRESH_MIN слотов — так старые на написании и новые на выборе идут вперемешку.
 */
export const selectRoundCards = (cards: Card[], levels: Levels): Card[] => {
  const active = cards.filter((c) => levels[c.uuid] === 1);
  const fresh = cards.filter((c) => levels[c.uuid] === 0);

  const freshTake = Math.min(fresh.length, Math.max(FRESH_MIN, ROUND_SIZE - active.length));
  const activeTake = Math.min(active.length, ROUND_SIZE - freshTake);

  return [...active.slice(0, activeTake), ...fresh.slice(0, freshTake)];
};

/** Очередь uuid'ов карточек текущего раунда (в перемешанном порядке). */
export const buildRoundQueue = (cards: Card[], levels: Levels): string[] =>
  shuffle(selectRoundCards(cards, levels)).map((c) => c.uuid);

/** Строит вопрос для карточки по её текущему уровню. */
export const buildQuestion = (card: Card, allCards: Card[], levels: Levels): LearnQuestion => {
  const type = questionTypeForLevel(levels[card.uuid] ?? 0);
  return {
    card,
    type,
    choices: type === 'choice' ? buildChoices(card, allCards) : [],
  };
};

/** Применяет результат ответа: верно → уровень +1 (макс 2), неверно → сброс в 0. */
export const applyAnswer = (levels: Levels, cardUuid: string, correct: boolean): Levels => {
  const current = levels[cardUuid] ?? 0;
  const next: CardLevel = correct ? (Math.min(current + 1, 2) as CardLevel) : 0;
  return { ...levels, [cardUuid]: next };
};
