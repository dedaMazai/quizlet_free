import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError, getCurrentUserId } from '@/shared/api/supabaseClient';
import {
  Deck, DeckCreateDto, DeckUpdateDto, DeckShareUser,
} from '../types/deck';

// Встроенный профиль автора (PostgREST embed по FK decks_owner_profile_fkey).
interface OwnerProfile {
  email: string;
  name: string | null;
}

// Строка таблицы decks в Supabase (RLS отдаёт колоды владельца и расшаренные ему).
interface DeckRow {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  owner: OwnerProfile | OwnerProfile[] | null;
  created_at: string;
  updated_at: string;
}

// PostgREST может отдать встроенную связь как объект или как массив из одного элемента.
const firstProfile = (profile: OwnerProfile | OwnerProfile[] | null): OwnerProfile | null =>
  (Array.isArray(profile) ? profile[0] ?? null : profile);

const mapDeck = (row: DeckRow, currentUserId: string | null): Deck => {
  const owner = firstProfile(row.owner);
  return {
    uuid: row.id,
    name: row.name,
    description: row.description ?? undefined,
    owner_id: row.user_id,
    is_owner: row.user_id === currentUserId,
    owner_name: owner?.name ?? undefined,
    owner_email: owner?.email ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const DECK_SELECT = '*, owner:profiles!decks_owner_profile_fkey(email, name)';

// Понятные сообщения для ошибок RPC share_deck_by_email.
const shareErrorMessage = (raw: string): string => {
  if (raw.includes('USER_NOT_FOUND')) return 'Пользователь не найден';
  if (raw.includes('CANNOT_SHARE_WITH_SELF')) return 'Нельзя поделиться с собой';
  if (raw.includes('NOT_OWNER')) return 'Только автор может поделиться колодой';
  return raw;
};

interface ShareRow {
  user_id: string;
  profiles: OwnerProfile | OwnerProfile[] | null;
}

const deckApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    getDecks: build.query<Deck[], void>({
      queryFn: async () => {
        const currentUserId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('decks')
          .select(DECK_SELECT)
          .order('created_at', { ascending: true });
        if (error) return supabaseError(error.message);
        return { data: (data as DeckRow[]).map((row) => mapDeck(row, currentUserId)) };
      },
      providesTags: [ApiTag.Decks],
    }),
    getDeck: build.query<Deck | undefined, string>({
      queryFn: async (uuid) => {
        const currentUserId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('decks')
          .select(DECK_SELECT)
          .eq('id', uuid)
          .maybeSingle();
        if (error) return supabaseError(error.message);
        return { data: data ? mapDeck(data as DeckRow, currentUserId) : undefined };
      },
      providesTags: (result) => (result ? [{ type: ApiTag.Deck, id: result.uuid }] : []),
    }),
    createDeck: build.mutation<Deck, DeckCreateDto>({
      queryFn: async (dto) => {
        const currentUserId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('decks')
          .insert({ name: dto.name, description: dto.description ?? null })
          .select(DECK_SELECT)
          .single();
        if (error) return supabaseError(error.message);
        return { data: mapDeck(data as DeckRow, currentUserId) };
      },
      invalidatesTags: [ApiTag.Decks],
    }),
    updateDeck: build.mutation<Deck, DeckUpdateDto>({
      queryFn: async (dto) => {
        const currentUserId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('decks')
          .update({ name: dto.name, description: dto.description ?? null })
          .eq('id', dto.uuid)
          .select(DECK_SELECT)
          .single();
        if (error) return supabaseError(error.message);
        return { data: mapDeck(data as DeckRow, currentUserId) };
      },
      invalidatesTags: (result) =>
        result ? [ApiTag.Decks, { type: ApiTag.Deck, id: result.uuid }] : [ApiTag.Decks],
    }),
    deleteDeck: build.mutation<void, string>({
      queryFn: async (uuid) => {
        // Карточки колоды удаляются каскадом на стороне БД (FK on delete cascade).
        const { error } = await supabase.from('decks').delete().eq('id', uuid);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.Decks, ApiTag.Cards],
    }),
    // Дублирование расшаренной колоды в собственную редактируемую копию (вместе со словами).
    duplicateDeck: build.mutation<Deck, Deck>({
      queryFn: async (source) => {
        const currentUserId = await getCurrentUserId();
        const { data: newDeck, error: deckError } = await supabase
          .from('decks')
          .insert({ name: `${source.name} (копия)`, description: source.description ?? null })
          .select(DECK_SELECT)
          .single();
        if (deckError) return supabaseError(deckError.message);

        const { data: srcCards, error: cardsError } = await supabase
          .from('cards')
          .select('term, translation, example')
          .eq('deck_id', source.uuid);
        if (cardsError) return supabaseError(cardsError.message);

        const rows = (srcCards as { term: string; translation: string; example: string | null }[]) ?? [];
        if (rows.length) {
          const { error: insertError } = await supabase.from('cards').insert(
            rows.map((card) => ({
              deck_id: (newDeck as DeckRow).id,
              term: card.term,
              translation: card.translation,
              example: card.example,
            })),
          );
          if (insertError) return supabaseError(insertError.message);
        }

        return { data: mapDeck(newDeck as DeckRow, currentUserId) };
      },
      invalidatesTags: [ApiTag.Decks, ApiTag.Cards],
    }),
    // Поделиться колодой по email (только владелец, проверка в RPC).
    shareDeck: build.mutation<void, { deckUuid: string; email: string }>({
      queryFn: async ({ deckUuid, email }) => {
        const { error } = await supabase.rpc('share_deck_by_email', {
          p_deck_id: deckUuid,
          p_email: email.trim().toLowerCase(),
        });
        if (error) return supabaseError(shareErrorMessage(error.message));
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.DeckShares],
    }),
    // Список пользователей, которым можно открыть доступ (все профили, кроме себя).
    getShareableUsers: build.query<DeckShareUser[], void>({
      queryFn: async () => {
        const currentUserId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, name')
          .order('email', { ascending: true });
        if (error) return supabaseError(error.message);
        return {
          data: (data as { id: string; email: string; name: string | null }[])
            .filter((row) => row.id !== currentUserId)
            .map((row) => ({
              user_id: row.id,
              email: row.email,
              name: row.name ?? undefined,
            })),
        };
      },
    }),
    getDeckShares: build.query<DeckShareUser[], string>({
      queryFn: async (deckUuid) => {
        const { data, error } = await supabase
          .from('deck_shares')
          .select('user_id, profiles(email, name)')
          .eq('deck_id', deckUuid);
        if (error) return supabaseError(error.message);
        return {
          data: (data as unknown as ShareRow[]).map((row) => {
            const profile = firstProfile(row.profiles);
            return {
              user_id: row.user_id,
              email: profile?.email ?? '',
              name: profile?.name ?? undefined,
            };
          }),
        };
      },
      providesTags: [ApiTag.DeckShares],
    }),
    // Удаление доступа: владельцем (отзыв) или гостем по своему userId («убрать из своих»).
    removeDeckShare: build.mutation<void, { deckUuid: string; userId: string }>({
      queryFn: async ({ deckUuid, userId }) => {
        const { error } = await supabase
          .from('deck_shares')
          .delete()
          .eq('deck_id', deckUuid)
          .eq('user_id', userId);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.DeckShares, ApiTag.Decks],
    }),
  }),
});

export const {
  useGetDecksQuery,
  useGetDeckQuery,
  useCreateDeckMutation,
  useUpdateDeckMutation,
  useDeleteDeckMutation,
  useDuplicateDeckMutation,
  useShareDeckMutation,
  useGetShareableUsersQuery,
  useGetDeckSharesQuery,
  useRemoveDeckShareMutation,
} = deckApi;
