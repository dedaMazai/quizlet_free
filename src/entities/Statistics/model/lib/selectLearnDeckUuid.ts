import type { DueSummary } from '../types/statistics';

/** Колода с наибольшим числом новых слов — цель «Учить новые» */
export const selectLearnDeckUuid = (summary?: DueSummary): string | undefined => {
  const best = summary?.perDeck.reduce<{ deckUuid: string; new: number } | null>(
    (acc, deck) => (deck.new > (acc?.new ?? 0) ? deck : acc),
    null,
  );
  return best?.deckUuid;
};
