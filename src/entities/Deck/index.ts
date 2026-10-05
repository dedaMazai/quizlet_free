export type {
  Deck, DeckCreateDto, DeckUpdateDto, DeckShareUser,
} from './model/types/deck';
export {
  useGetDecksQuery,
  useGetDeckQuery,
  useCreateDeckMutation,
  useUpdateDeckMutation,
  useDeleteDeckMutation,
  useDuplicateDeckMutation,
  useSetDeckSharedEditMutation,
  useShareDeckMutation,
  useGetShareableUsersQuery,
  useGetDeckSharesQuery,
  useRemoveDeckShareMutation,
} from './model/api/deckApi';
export { DeckCard } from './ui/DeckCard/DeckCard';
export { DeckCardSkeleton } from './ui/DeckCard/DeckCardSkeleton';
export { getRecentDeckUuids, pushRecentDeck } from './model/lib/recentDecks';
