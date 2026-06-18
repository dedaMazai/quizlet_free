import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError, getCurrentUserId } from '@/shared/api/supabaseClient';
import { Card, CardCreateDto, CardUpdateDto } from '../types/card';
import { LearnProgress } from '../types/learnProgress';

// Строка таблицы cards в Supabase (RLS ограничивает выборку текущим пользователем).
interface CardRow {
  id: string;
  deck_id: string;
  term: string;
  translation: string;
  example: string | null;
  created_at: string;
  updated_at: string;
}

interface ProgressRow {
  deck_key: string;
  levels: LearnProgress['levels'];
  updated_at: string;
}

const mapCard = (row: CardRow): Card => ({
  uuid: row.id,
  deck_uuid: row.deck_id,
  term: row.term,
  translation: row.translation,
  example: row.example ?? undefined,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const cardApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    getCards: build.query<Card[], string | void>({
      queryFn: async (deckUuid) => {
        let query = supabase.from('cards').select('*').order('created_at', { ascending: true });
        if (deckUuid) {
          query = query.eq('deck_id', deckUuid);
        }
        const { data, error } = await query;
        if (error) return supabaseError(error.message);
        return { data: (data as CardRow[]).map(mapCard) };
      },
      providesTags: [ApiTag.Cards],
    }),
    createCard: build.mutation<Card, CardCreateDto>({
      queryFn: async (dto) => {
        const { data, error } = await supabase
          .from('cards')
          .insert({
            deck_id: dto.deck_uuid,
            term: dto.term,
            translation: dto.translation,
            example: dto.example ?? null,
          })
          .select()
          .single();
        if (error) return supabaseError(error.message);
        return { data: mapCard(data as CardRow) };
      },
      invalidatesTags: [ApiTag.Cards],
    }),
    updateCard: build.mutation<Card, CardUpdateDto>({
      queryFn: async (dto) => {
        const { data, error } = await supabase
          .from('cards')
          .update({
            term: dto.term,
            translation: dto.translation,
            example: dto.example ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', dto.uuid)
          .select()
          .single();
        if (error) return supabaseError(error.message);
        return { data: mapCard(data as CardRow) };
      },
      invalidatesTags: [ApiTag.Cards],
    }),
    createCards: build.mutation<Card[], CardCreateDto[]>({
      queryFn: async (dtos) => {
        const { data, error } = await supabase
          .from('cards')
          .insert(
            dtos.map((dto) => ({
              deck_id: dto.deck_uuid,
              term: dto.term,
              translation: dto.translation,
              example: dto.example ?? null,
            })),
          )
          .select();
        if (error) return supabaseError(error.message);
        return { data: (data as CardRow[]).map(mapCard) };
      },
      invalidatesTags: [ApiTag.Cards],
    }),
    deleteCard: build.mutation<void, string>({
      queryFn: async (uuid) => {
        const { error } = await supabase.from('cards').delete().eq('id', uuid);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.Cards],
    }),
    deleteCardsByDeck: build.mutation<void, string>({
      queryFn: async (deckUuid) => {
        const { error } = await supabase.from('cards').delete().eq('deck_id', deckUuid);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.Cards],
    }),
    getLearnProgress: build.query<LearnProgress | null, string>({
      queryFn: async (deckUuid) => {
        const { data, error } = await supabase
          .from('learn_progress')
          .select('*')
          .eq('deck_key', deckUuid)
          .maybeSingle();
        if (error) return supabaseError(error.message);
        if (!data) return { data: null };
        const row = data as ProgressRow;
        return {
          data: { deck_uuid: row.deck_key, levels: row.levels, updated_at: row.updated_at },
        };
      },
      providesTags: [ApiTag.LearnProgress],
    }),
    saveLearnProgress: build.mutation<LearnProgress, LearnProgress>({
      queryFn: async (progress) => {
        const userId = await getCurrentUserId();
        if (!userId) return supabaseError('Not authenticated');
        const updatedAt = new Date().toISOString();
        const { error } = await supabase
          .from('learn_progress')
          .upsert(
            {
              user_id: userId,
              deck_key: progress.deck_uuid,
              levels: progress.levels,
              updated_at: updatedAt,
            },
            { onConflict: 'user_id,deck_key' },
          );
        if (error) return supabaseError(error.message);
        return { data: { ...progress, updated_at: updatedAt } };
      },
      invalidatesTags: [ApiTag.LearnProgress],
    }),
    getFavorites: build.query<string[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('favorites').select('card_id');
        if (error) return supabaseError(error.message);
        return { data: (data as { card_id: string }[]).map((row) => row.card_id) };
      },
      providesTags: [ApiTag.Favorites],
    }),
    toggleFavorite: build.mutation<string[], string>({
      queryFn: async (cardUuid) => {
        const userId = await getCurrentUserId();
        if (!userId) return supabaseError('Not authenticated');

        const { data: existing, error: selectError } = await supabase
          .from('favorites')
          .select('card_id')
          .eq('card_id', cardUuid)
          .maybeSingle();
        if (selectError) return supabaseError(selectError.message);

        const mutation = existing
          ? supabase.from('favorites').delete().eq('card_id', cardUuid)
          : supabase.from('favorites').insert({ user_id: userId, card_id: cardUuid });
        const { error: mutationError } = await mutation;
        if (mutationError) return supabaseError(mutationError.message);

        const { data, error } = await supabase.from('favorites').select('card_id');
        if (error) return supabaseError(error.message);
        return { data: (data as { card_id: string }[]).map((row) => row.card_id) };
      },
      invalidatesTags: [ApiTag.Favorites],
    }),
  }),
});

export const {
  useGetCardsQuery,
  useCreateCardMutation,
  useCreateCardsMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useDeleteCardsByDeckMutation,
  useGetLearnProgressQuery,
  useSaveLearnProgressMutation,
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
} = cardApi;
