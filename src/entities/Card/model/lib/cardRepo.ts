import { createLocalCollection } from '@/shared/lib/storage';
import { Card } from '../types/card';
import { cardSeed } from './seedData';

const collection = createLocalCollection<Card>('cards', { seed: cardSeed });

export const cardRepo = {
  ...collection,
  getByDeck: (deckUuid: string): Card[] =>
    collection.getAll().filter((card) => card.deck_uuid === deckUuid),
  removeByDeck: (deckUuid: string): void => {
    collection
      .getAll()
      .filter((card) => card.deck_uuid === deckUuid)
      .forEach((card) => collection.remove(card.uuid));
  },
};
