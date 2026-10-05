import { CardReview, CardStatus } from '../types/cardReview';
import { isDue } from './srs';

/** Статус по уровню освоения — как в get_mastery: 2 «усвоено», 1 «изучаю», иначе «новое». */
export const statusOf = (review: CardReview | null): Exclude<CardStatus, 'due'> => {
  if (review?.level === 2) return 'mastered';
  if (review?.level === 1) return 'learning';
  return 'new';
};

/** Статус с учётом долга: изученная карточка, которую пора повторить, — «due». */
export const dueStatusOf = (review: CardReview | null, now: Date = new Date()): CardStatus => (
  review && isDue(review, now) ? 'due' : statusOf(review)
);
