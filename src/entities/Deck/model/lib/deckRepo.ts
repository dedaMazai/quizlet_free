import { createLocalCollection } from '@/shared/lib/storage';
import { Deck } from '../types/deck';
import { deckSeed } from './seedData';

export const deckRepo = createLocalCollection<Deck>('decks', { seed: deckSeed });
