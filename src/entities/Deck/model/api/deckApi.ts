import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { Deck, DeckCreateDto, DeckUpdateDto } from '../types/deck';
import { deckRepo } from '../lib/deckRepo';

const deckApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    getDecks: build.query<Deck[], void>({
      queryFn: () => ({ data: deckRepo.getAll() }),
      providesTags: [ApiTag.Decks],
    }),
    getDeck: build.query<Deck | undefined, string>({
      queryFn: (uuid) => ({ data: deckRepo.getById(uuid) }),
      providesTags: (result) => (result ? [{ type: ApiTag.Deck, id: result.uuid }] : []),
    }),
    createDeck: build.mutation<Deck, DeckCreateDto>({
      queryFn: (dto) => {
        const now = new Date().toISOString();
        const deck: Deck = {
          uuid: crypto.randomUUID(),
          name: dto.name,
          description: dto.description,
          created_at: now,
          updated_at: now,
        };
        return { data: deckRepo.insert(deck) };
      },
      invalidatesTags: [ApiTag.Decks],
    }),
    updateDeck: build.mutation<Deck, DeckUpdateDto>({
      queryFn: (dto) => {
        const existing = deckRepo.getById(dto.uuid);
        const now = new Date().toISOString();
        const deck: Deck = {
          uuid: dto.uuid,
          name: dto.name,
          description: dto.description,
          created_at: existing?.created_at ?? now,
          updated_at: now,
        };
        return { data: deckRepo.update(deck) };
      },
      invalidatesTags: (result) =>
        result ? [ApiTag.Decks, { type: ApiTag.Deck, id: result.uuid }] : [ApiTag.Decks],
    }),
    deleteDeck: build.mutation<void, string>({
      queryFn: (uuid) => {
        deckRepo.remove(uuid);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.Decks],
    }),
  }),
});

export const {
  useGetDecksQuery,
  useGetDeckQuery,
  useCreateDeckMutation,
  useUpdateDeckMutation,
  useDeleteDeckMutation,
} = deckApi;
