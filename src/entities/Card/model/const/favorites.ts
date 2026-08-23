/**
 * Ключ журнала статистики для виртуальной колоды «Избранное».
 * Пишется в study_events.deck_key — показывает, ГДЕ пользователь отвечал.
 * Прогресс заучивания на него больше не завязан: он лежит в card_reviews
 * по (user_id, card_id), одинаковый во всех представлениях.
 */
export const FAVORITES_PROGRESS_KEY = '__favorites__';

/** Префикс ключа журнала для избранного в рамках одной колоды. */
export const DECK_FAVORITES_PROGRESS_PREFIX = `${FAVORITES_PROGRESS_KEY}:`;

/** Ключ журнала «избранное колоды»: __favorites__:<deckUuid>. */
export const getDeckFavoritesProgressKey = (deckUuid: string): string =>
  `${DECK_FAVORITES_PROGRESS_PREFIX}${deckUuid}`;
