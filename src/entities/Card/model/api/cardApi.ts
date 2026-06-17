import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { Card, CardCreateDto, CardUpdateDto } from '../types/card';
import { LearnProgress } from '../types/learnProgress';
import { cardRepo } from '../lib/cardRepo';
import { learnProgressRepo } from '../lib/learnProgressRepo';
import { favoritesRepo } from '../lib/favoritesRepo';

const cardApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    getCards: build.query<Card[], string | void>({
      queryFn: (deckUuid) => ({
        data: deckUuid ? cardRepo.getByDeck(deckUuid) : cardRepo.getAll(),
      }),
      providesTags: [ApiTag.Cards],
    }),
    createCard: build.mutation<Card, CardCreateDto>({
      queryFn: (dto) => {
        const now = new Date().toISOString();
        const card: Card = {
          uuid: crypto.randomUUID(),
          deck_uuid: dto.deck_uuid,
          term: dto.term,
          translation: dto.translation,
          example: dto.example,
          created_at: now,
          updated_at: now,
        };
        return { data: cardRepo.insert(card) };
      },
      invalidatesTags: [ApiTag.Cards],
    }),
    updateCard: build.mutation<Card, CardUpdateDto>({
      queryFn: (dto) => {
        const existing = cardRepo.getById(dto.uuid);
        const now = new Date().toISOString();
        const card: Card = {
          uuid: dto.uuid,
          deck_uuid: existing?.deck_uuid ?? '',
          term: dto.term,
          translation: dto.translation,
          example: dto.example,
          created_at: existing?.created_at ?? now,
          updated_at: now,
        };
        return { data: cardRepo.update(card) };
      },
      invalidatesTags: [ApiTag.Cards],
    }),
    deleteCard: build.mutation<void, string>({
      queryFn: (uuid) => {
        cardRepo.remove(uuid);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.Cards],
    }),
    deleteCardsByDeck: build.mutation<void, string>({
      queryFn: (deckUuid) => {
        cardRepo.removeByDeck(deckUuid);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.Cards],
    }),
    getLearnProgress: build.query<LearnProgress | null, string>({
      queryFn: (deckUuid) => ({ data: learnProgressRepo.get(deckUuid) }),
      providesTags: [ApiTag.LearnProgress],
    }),
    saveLearnProgress: build.mutation<LearnProgress, LearnProgress>({
      queryFn: (progress) => ({ data: learnProgressRepo.save(progress) }),
      invalidatesTags: [ApiTag.LearnProgress],
    }),
    getFavorites: build.query<string[], void>({
      queryFn: () => ({ data: favoritesRepo.getAll() }),
      providesTags: [ApiTag.Favorites],
    }),
    toggleFavorite: build.mutation<string[], string>({
      queryFn: (uuid) => ({ data: favoritesRepo.toggle(uuid) }),
      invalidatesTags: [ApiTag.Favorites],
    }),
  }),
});

export const {
  useGetCardsQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useDeleteCardsByDeckMutation,
  useGetLearnProgressQuery,
  useSaveLearnProgressMutation,
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
} = cardApi;
