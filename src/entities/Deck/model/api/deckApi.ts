import i18n from '@/shared/config/i18n/i18n';
import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError, getCurrentUserId } from '@/shared/api/supabaseClient';
import {
  Deck, DeckCreateDto, DeckUpdateDto, DeckShareUser,
} from '../types/deck';

// Имя и email участника общей колоды. Чужие профили напрямую не читаются (RLS profiles —
// только свой и админ), их отдаёт RPC get_profiles_brief (supabase/privacy.sql).
interface OwnerProfile {
  email: string;
  name: string | null;
}

interface BriefProfileRow extends OwnerProfile {
  id: string;
}

// Строка таблицы decks в Supabase (RLS отдаёт колоды владельца и расшаренные ему).
interface DeckRow {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  allow_shared_edit: boolean;
  cards: { count: number }[] | null;
  created_at: string;
  updated_at: string;
}

// Профили участников общих колод одним запросом; RPC вернёт только тех, с кем есть общая колода.
const fetchProfilesBrief = async (ids: string[]): Promise<Map<string, OwnerProfile>> => {
  const unique = [...new Set(ids)];
  if (!unique.length) return new Map();
  const { data, error } = await supabase.rpc('get_profiles_brief', { p_ids: unique });
  // Без имени автора колода остаётся рабочей — ошибку не пробрасываем.
  if (error || !data) return new Map();
  return new Map((data as BriefProfileRow[]).map((row) => [row.id, { email: row.email, name: row.name }]));
};

const mapDeck = (row: DeckRow, currentUserId: string | null, owner?: OwnerProfile): Deck => {
  return {
    uuid: row.id,
    name: row.name,
    description: row.description ?? undefined,
    owner_id: row.user_id,
    is_owner: row.user_id === currentUserId,
    owner_name: owner?.name ?? undefined,
    owner_email: owner?.email ?? undefined,
    cards_count: row.cards?.[0]?.count ?? 0,
    allow_shared_edit: row.allow_shared_edit,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const DECK_SELECT = '*, cards(count)';

// Колоды с именами авторов: свои — без запроса, чужие (расшаренные) — через get_profiles_brief.
const mapDecks = async (rows: DeckRow[], currentUserId: string | null): Promise<Deck[]> => {
  const owners = await fetchProfilesBrief(
    rows.filter((row) => row.user_id !== currentUserId).map((row) => row.user_id),
  );
  return rows.map((row) => mapDeck(row, currentUserId, owners.get(row.user_id)));
};

// Понятные сообщения для ошибок RPC share_deck_by_email.
const shareErrorMessage = (raw: string): string => {
  if (raw.includes('NOT_CONTACT')) return 'Делиться можно только с контактами';
  if (raw.includes('NOT_OWNER')) return 'Только автор может поделиться колодой';
  return raw;
};

interface ShareRow {
  user_id: string;
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
        return { data: await mapDecks(data as DeckRow[], currentUserId) };
      },
      // Cards — чтобы счётчики слов обновлялись после мутаций карточек.
      providesTags: [ApiTag.Decks, ApiTag.Cards],
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
        if (!data) return { data: undefined };
        const [deck] = await mapDecks([data as DeckRow], currentUserId);
        return { data: deck };
      },
      providesTags: (result) =>
        (result ? [{ type: ApiTag.Deck, id: result.uuid }, ApiTag.Cards] : [ApiTag.Cards]),
    }),
    createDeck: build.mutation<Deck, DeckCreateDto>({
      queryFn: async (dto) => {
        const currentUserId = await getCurrentUserId();
        // Общее редактирование включено по умолчанию: чаще всего участники должны редактировать.
        const { data, error } = await supabase
          .from('decks')
          .insert({ name: dto.name, description: dto.description ?? null, allow_shared_edit: true })
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
        const [deck] = await mapDecks([data as DeckRow], currentUserId);
        return { data: deck };
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
          .insert({
            name: `${source.name} (${i18n.t('копия')})`,
            description: source.description ?? null,
            allow_shared_edit: true,
          })
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
    // Переключение общего редактирования (RLS разрешает update только владельцу).
    setDeckSharedEdit: build.mutation<Deck, { uuid: string; allow: boolean }>({
      queryFn: async ({ uuid, allow }) => {
        const currentUserId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('decks')
          .update({ allow_shared_edit: allow })
          .eq('id', uuid)
          .select(DECK_SELECT)
          .single();
        if (error) return supabaseError(error.message);
        return { data: mapDeck(data as DeckRow, currentUserId) };
      },
      invalidatesTags: (result) =>
        (result ? [ApiTag.Decks, { type: ApiTag.Deck, id: result.uuid }] : [ApiTag.Decks]),
    }),
    // Поделиться колодой по email (только владелец, проверка в RPC).
    // Только контактам (supabase/contacts.sql): чужой email больше не вводится.
    shareDeck: build.mutation<void, { deckUuid: string; userIds: string[] }>({
      queryFn: async ({ deckUuid, userIds }) => {
        const { error } = await supabase.rpc('share_deck_with_contacts', {
          p_deck_id: deckUuid,
          p_user_ids: userIds,
        });
        if (error) return supabaseError(shareErrorMessage(error.message));
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.DeckShares],
    }),
    getDeckShares: build.query<DeckShareUser[], string>({
      queryFn: async (deckUuid) => {
        const { data, error } = await supabase
          .from('deck_shares')
          .select('user_id')
          .eq('deck_id', deckUuid);
        if (error) return supabaseError(error.message);
        const rows = data as ShareRow[];
        const profiles = await fetchProfilesBrief(rows.map((row) => row.user_id));
        return {
          data: rows.map((row) => {
            const profile = profiles.get(row.user_id);
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
        const currentUserId = await getCurrentUserId();
        // Гость убирает колоду у себя — RPC чистит его прогресс, если тот нулевой
        // (card_reviews и append-only study_events недоступны для delete с клиента).
        if (userId === currentUserId) {
          const { error } = await supabase.rpc('leave_shared_deck', { p_deck_id: deckUuid });
          if (error) return supabaseError(error.message);
          return { data: undefined };
        }
        // Владелец отзывает доступ у другого пользователя — прогресс гостя не трогаем.
        const { error } = await supabase
          .from('deck_shares')
          .delete()
          .eq('deck_id', deckUuid)
          .eq('user_id', userId);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.DeckShares, ApiTag.Decks, ApiTag.CardReviews, ApiTag.StudyStats],
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
  useSetDeckSharedEditMutation,
  useShareDeckMutation,
  useGetDeckSharesQuery,
  useRemoveDeckShareMutation,
} = deckApi;
