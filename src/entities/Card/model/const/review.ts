/**
 * Ключ журнала статистики для очереди повторов.
 * Как и остальные синтетические ключи, пишется только в study_events.deck_key:
 * прогресс повторения живёт в card_reviews по (user_id, card_id).
 */
export const REVIEW_EVENTS_KEY = '__review__';
