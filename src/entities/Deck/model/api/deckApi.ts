import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError } from '@/shared/api/supabaseClient';
import { Deck, DeckCreateDto, DeckUpdateDto } from '../types/deck';

// Строка таблицы decks в Supabase (RLS отдаёт только колоды текущего пользователя).
interface DeckRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const mapDeck = (row: DeckRow): Deck => ({
  uuid: row.id,
  name: row.name,
  description: row.description ?? undefined,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const deckApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    getDecks: build.query<Deck[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('decks')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) return supabaseError(error.message);
        return { data: (data as DeckRow[]).map(mapDeck) };
      },
      providesTags: [ApiTag.Decks],
    }),
    getDeck: build.query<Deck | undefined, string>({
      queryFn: async (uuid) => {
        const { data, error } = await supabase
          .from('decks')
          .select('*')
          .eq('id', uuid)
          .maybeSingle();
        if (error) return supabaseError(error.message);
        return { data: data ? mapDeck(data as DeckRow) : undefined };
      },
      providesTags: (result) => (result ? [{ type: ApiTag.Deck, id: result.uuid }] : []),
    }),
    createDeck: build.mutation<Deck, DeckCreateDto>({
      queryFn: async (dto) => {
        const { data, error } = await supabase
          .from('decks')
          .insert({ name: dto.name, description: dto.description ?? null })
          .select()
          .single();
        if (error) return supabaseError(error.message);
        return { data: mapDeck(data as DeckRow) };
      },
      invalidatesTags: [ApiTag.Decks],
    }),
    updateDeck: build.mutation<Deck, DeckUpdateDto>({
      queryFn: async (dto) => {
        const { data, error } = await supabase
          .from('decks')
          .update({ name: dto.name, description: dto.description ?? null })
          .eq('id', dto.uuid)
          .select()
          .single();
        if (error) return supabaseError(error.message);
        return { data: mapDeck(data as DeckRow) };
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
  }),
});

export const {
  useGetDecksQuery,
  useGetDeckQuery,
  useCreateDeckMutation,
  useUpdateDeckMutation,
  useDeleteDeckMutation,
} = deckApi;
