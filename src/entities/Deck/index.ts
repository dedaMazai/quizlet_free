export type { Deck, DeckCreateDto, DeckUpdateDto } from './model/types/deck';
export {
  useGetDecksQuery,
  useGetDeckQuery,
  useCreateDeckMutation,
  useUpdateDeckMutation,
  useDeleteDeckMutation,
} from './model/api/deckApi';
