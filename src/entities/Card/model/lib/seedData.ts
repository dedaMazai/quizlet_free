import { Card } from '../types/card';

// uuid демо-колод дублируются из entities/Deck/model/lib/seedData.ts
// (FSD запрещает импорт между сущностями одного слоя).
const SEED_DECK_TRAVEL = 'seed-deck-travel';
const SEED_DECK_FOOD = 'seed-deck-food';

const SEED_DATE = '2024-01-01T00:00:00.000Z';

const buildCard = (deck_uuid: string, term: string, translation: string): Card => ({
  uuid: `seed-card-${deck_uuid}-${term}`,
  deck_uuid,
  term,
  translation,
  created_at: SEED_DATE,
  updated_at: SEED_DATE,
});

export const cardSeed: Card[] = [
  buildCard(SEED_DECK_TRAVEL, 'airport', 'аэропорт'),
  buildCard(SEED_DECK_TRAVEL, 'luggage', 'багаж'),
  buildCard(SEED_DECK_TRAVEL, 'ticket', 'билет'),
  buildCard(SEED_DECK_TRAVEL, 'passport', 'паспорт'),
  buildCard(SEED_DECK_TRAVEL, 'flight', 'рейс'),
  buildCard(SEED_DECK_TRAVEL, 'hotel', 'отель'),
  buildCard(SEED_DECK_TRAVEL, 'map', 'карта'),
  buildCard(SEED_DECK_TRAVEL, 'journey', 'путешествие'),

  buildCard(SEED_DECK_FOOD, 'bread', 'хлеб'),
  buildCard(SEED_DECK_FOOD, 'cheese', 'сыр'),
  buildCard(SEED_DECK_FOOD, 'apple', 'яблоко'),
  buildCard(SEED_DECK_FOOD, 'water', 'вода'),
  buildCard(SEED_DECK_FOOD, 'meat', 'мясо'),
  buildCard(SEED_DECK_FOOD, 'soup', 'суп'),
  buildCard(SEED_DECK_FOOD, 'egg', 'яйцо'),
  buildCard(SEED_DECK_FOOD, 'sugar', 'сахар'),
];
