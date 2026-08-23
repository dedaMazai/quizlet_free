import { Card } from '@/entities/Card';
import { normalize } from '@/shared/lib/text';
import { shuffle } from '@/shared/lib/utils';

/** Границы длины фразы: из одного слова собирать нечего, длинные не влезают на экран. */
export const MIN_WORDS = 2;
export const MAX_WORDS = 8;

export interface OrderItem {
  card: Card;
  /** Слова фразы в перемешанном порядке. */
  bank: string[];
}

const wordsOf = (term: string): string[] => term.trim().split(/\s+/);

/** Карточка годится, если это фраза подходящей длины. */
export const isOrderable = (card: Card): boolean => {
  if (card.card_type !== 'phrase') return false;
  const count = wordsOf(card.term).length;
  return count >= MIN_WORDS && count <= MAX_WORDS;
};

/** Годные карточки в случайном порядке, слова внутри каждой тоже перемешаны. */
export const buildOrderItems = (cards: Card[]): OrderItem[] =>
  shuffle(cards.filter(isOrderable)).map((card) => ({
    card,
    bank: shuffle(wordsOf(card.term)),
  }));

/** Сколько карточек колоды годятся для режима. */
export const countOrderableCards = (cards: Card[]): number =>
  cards.reduce((acc, card) => acc + (isOrderable(card) ? 1 : 0), 0);

/** Собранная фраза совпадает с исходной. */
export const isOrderCorrect = (card: Card, answer: string[]): boolean =>
  normalize(answer.join(' ')) === normalize(card.term);
