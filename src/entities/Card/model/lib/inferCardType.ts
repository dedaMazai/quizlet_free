import { CardType } from '../types/card';

/** Многословный term считаем фразой (чанком), одно слово — словом. */
export const inferCardType = (term: string): CardType => (
  term.trim().split(/\s+/).length > 1 ? 'phrase' : 'word'
);
