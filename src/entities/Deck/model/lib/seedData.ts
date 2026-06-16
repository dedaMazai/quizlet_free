import { Deck } from '../types/deck';

// Фиксированные uuid демо-колод. Те же значения используются в seed карточек
// (entities/Card/model/lib/seedData.ts), чтобы карточки ссылались на эти колоды.
export const SEED_DECK_TRAVEL = 'seed-deck-travel';
export const SEED_DECK_FOOD = 'seed-deck-food';

const SEED_DATE = '2024-01-01T00:00:00.000Z';

export const deckSeed: Deck[] = [
  {
    uuid: SEED_DECK_TRAVEL,
    name: 'Путешествия',
    description: 'Базовые слова для поездок',
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
  },
  {
    uuid: SEED_DECK_FOOD,
    name: 'Еда',
    description: 'Продукты и блюда',
    created_at: SEED_DATE,
    updated_at: SEED_DATE,
  },
];
