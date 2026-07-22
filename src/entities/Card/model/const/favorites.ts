/**
 * Ключ прогресса заучивания для виртуальной колоды «Избранное».
 * Используется как deck_uuid в learnProgressRepo, чтобы прогресс избранного
 * не смешивался с прогрессом обычных колод.
 */
export const FAVORITES_PROGRESS_KEY = '__favorites__';

/** Префикс ключа прогресса заучивания избранного в рамках одной колоды. */
export const DECK_FAVORITES_PROGRESS_PREFIX = `${FAVORITES_PROGRESS_KEY}:`;

/** Ключ прогресса «избранное колоды»: __favorites__:<deckUuid>. */
export const getDeckFavoritesProgressKey = (deckUuid: string): string =>
  `${DECK_FAVORITES_PROGRESS_PREFIX}${deckUuid}`;
