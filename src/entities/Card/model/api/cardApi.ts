import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError, getCurrentUserId } from '@/shared/api/supabaseClient';
import {
  Card, CardCreateDto, CardType, CardUpdateDto, CardsPage, CardsPageArgs,
} from '../types/card';
import { inferCardType } from '../lib/inferCardType';
import {
  CardReview, DueCard, LibraryCardsArgs, LibraryCardsPage,
} from '../types/cardReview';
import { AiCheckInput, AiCheckResult } from '../types/aiCheck';
import { AiChunkInput, AiChunksResult } from '../types/aiChunks';

// Строка таблицы cards в Supabase (RLS ограничивает выборку текущим пользователем).
interface CardRow {
  id: string;
  deck_id: string;
  term: string;
  translation: string;
  example: string | null;
  card_type: CardType;
  parent_card_id: string | null;
  created_at: string;
  updated_at: string;
}

// Строка card_reviews; card_uuid на клиенте = card_id в базе.
interface ReviewRow {
  card_id: string;
  level: number;
  reps: number;
  lapses: number;
  ease: number;
  interval_days: number;
  due_at: string;
  last_reviewed_at: string | null;
}

// Выдача get_due_cards: поля карточки + поля повторения в одной строке.
interface DueRow extends CardRow {
  level: number | null;
  reps: number | null;
  lapses: number | null;
  ease: number | null;
  interval_days: number | null;
  due_at: string | null;
  last_reviewed_at: string | null;
}


const mapReview = (row: ReviewRow): CardReview => ({
  card_uuid: row.card_id,
  level: row.level as CardReview['level'],
  reps: row.reps,
  lapses: row.lapses,
  ease: row.ease,
  interval_days: row.interval_days,
  due_at: row.due_at,
  last_reviewed_at: row.last_reviewed_at ?? undefined,
});

const mapDueCard = (row: DueRow): DueCard => ({
  card: mapCard(row),
  review: row.due_at === null ? null : mapReview({
    card_id: row.id,
    level: row.level ?? 0,
    reps: row.reps ?? 0,
    lapses: row.lapses ?? 0,
    ease: row.ease ?? 0,
    interval_days: row.interval_days ?? 0,
    due_at: row.due_at,
    last_reviewed_at: row.last_reviewed_at,
  }),
});

const mapCard = (row: CardRow): Card => ({
  uuid: row.id,
  deck_uuid: row.deck_id,
  term: row.term,
  translation: row.translation,
  example: row.example ?? undefined,
  card_type: row.card_type,
  parent_card_uuid: row.parent_card_id ?? undefined,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

// Шаблон для ilike внутри or(): экранируем спецсимволы LIKE и кавычки,
// сам шаблон берём в двойные кавычки — иначе запятые/скобки в запросе ломают синтаксис or().
const toSearchPattern = (raw: string): string => {
  const escaped = raw.replace(/[\\%_"]/g, (char) => `\\${char}`);
  return `"%${escaped}%"`;
};

const cardApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    getCards: build.query<Card[], string | void>({
      queryFn: async (deckUuid) => {
        // PostgREST отдаёт максимум 1000 строк за запрос — выбираем все постранично.
        // Вторичная сортировка по id: created_at совпадает у карточек из bulk-вставки,
        // без неё страницы могут пересекаться или терять строки.
        const PAGE_SIZE = 1000;
        const rows: CardRow[] = [];
        for (let from = 0; ; from += PAGE_SIZE) {
          let query = supabase
            .from('cards')
            .select('*')
            .order('created_at', { ascending: true })
            .order('id', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);
          if (deckUuid) {
            query = query.eq('deck_id', deckUuid);
          }
          const { data, error } = await query;
          if (error) return supabaseError(error.message);
          const page = data as CardRow[];
          rows.push(...page);
          if (page.length < PAGE_SIZE) break;
        }
        return { data: rows.map(mapCard) };
      },
      providesTags: [ApiTag.Cards],
    }),
    // Страница слов с сервера: пагинация, поиск и фильтры без загрузки всей таблицы.
    getCardsPage: build.query<CardsPage, CardsPageArgs>({
      queryFn: async ({
        page, pageSize, search, deckUuid, uuids,
      }) => {
        if (uuids && uuids.length === 0) {
          return { data: { cards: [], total: 0 } };
        }
        let query = supabase
          .from('cards')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: true })
          .order('id', { ascending: true })
          .range((page - 1) * pageSize, page * pageSize - 1);
        if (deckUuid) {
          query = query.eq('deck_id', deckUuid);
        }
        if (uuids) {
          query = query.in('id', uuids);
        }
        const trimmed = search?.trim();
        if (trimmed) {
          const pattern = toSearchPattern(trimmed);
          query = query.or(
            `term.ilike.${pattern},translation.ilike.${pattern},example.ilike.${pattern}`,
          );
        }
        const { data, error, count } = await query;
        if (error) return supabaseError(error.message);
        return { data: { cards: (data as CardRow[]).map(mapCard), total: count ?? 0 } };
      },
      providesTags: [ApiTag.Cards],
    }),
    // Библиотека: страница слов вместе со статусом и датой показа (get_library_cards).
    getLibraryCards: build.query<LibraryCardsPage, LibraryCardsArgs>({
      queryFn: async ({
        search, deckUuid, status, type, uuids, page, pageSize,
      }) => {
        if (uuids && uuids.length === 0) {
          return { data: { items: [], total: 0, deckCount: 0 } };
        }
        const paged = page !== undefined && pageSize !== undefined;
        const { data, error } = await supabase.rpc('get_library_cards', {
          p_search: search?.trim() || null,
          p_deck_id: deckUuid ?? null,
          p_status: status ?? null,
          p_type: type ?? null,
          p_ids: uuids ?? null,
          p_offset: paged ? (page - 1) * pageSize : 0,
          p_limit: paged ? pageSize : null,
        });
        if (error) return supabaseError(error.message);
        const row = data as { total: number; deck_count: number; cards: DueRow[] };
        return {
          data: {
            items: row.cards.map(mapDueCard),
            total: row.total,
            deckCount: row.deck_count,
          },
        };
      },
      providesTags: [ApiTag.Cards, ApiTag.CardReviews],
    }),
    // Общее число слов пользователя (без загрузки строк).
    getCardsCount: build.query<number, void>({
      queryFn: async () => {
        const { count, error } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true });
        if (error) return supabaseError(error.message);
        return { data: count ?? 0 };
      },
      providesTags: [ApiTag.Cards],
    }),
    // Последние добавленные слова (для блока на главной).
    getRecentCards: build.query<Card[], number>({
      queryFn: async (limit) => {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .limit(limit);
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
            card_type: dto.card_type ?? inferCardType(dto.term),
            parent_card_id: dto.parent_card_uuid ?? null,
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
            card_type: dto.card_type ?? inferCardType(dto.term),
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
              card_type: dto.card_type ?? inferCardType(dto.term),
              parent_card_id: dto.parent_card_uuid ?? null,
            })),
          )
          .select();
        if (error) return supabaseError(error.message);
        return { data: (data as CardRow[]).map(mapCard) };
      },
      invalidatesTags: [ApiTag.Cards],
    }),
    updateCardsBulk: build.mutation<void, { uuid: string; translation: string; example: string | null }[]>({
      queryFn: async (cards) => {
        const p_cards = cards.map((c) => ({ id: c.uuid, translation: c.translation, example: c.example }));
        const { error } = await supabase.rpc('update_cards_bulk', { p_cards });
        if (error) return supabaseError(error.message);
        return { data: undefined };
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
    // --- Интервальные повторы (SRS) ---
    // Прогресс лежит на карточке: deck_uuid здесь лишь сужает выборку.
    getCardReviews: build.query<CardReview[], string | undefined>({
      queryFn: async (deckUuid) => {
        // Сужение по колоде делаем inner join'ом, а не списком id в .in():
        // у колоды на сотни слов такой список раздул бы URL до отказа запроса.
        const query = deckUuid
          ? supabase
            .from('card_reviews')
            .select('*, cards!inner(deck_id)')
            .eq('cards.deck_id', deckUuid)
          : supabase.from('card_reviews').select('*');
        const { data, error } = await query;
        if (error) return supabaseError(error.message);
        return { data: (data as ReviewRow[]).map(mapReview) };
      },
      providesTags: [ApiTag.CardReviews],
    }),
    // Батч: сессия копит изменения и сбрасывает их пачкой, а не на каждый ответ.
    saveCardReviews: build.mutation<void, CardReview[]>({
      queryFn: async (reviews) => {
        if (reviews.length === 0) return { data: undefined };
        const userId = await getCurrentUserId();
        if (!userId) return supabaseError('Not authenticated');
        const { error } = await supabase
          .from('card_reviews')
          .upsert(
            reviews.map((review) => ({
              user_id: userId,
              card_id: review.card_uuid,
              level: review.level,
              reps: review.reps,
              lapses: review.lapses,
              ease: review.ease,
              interval_days: review.interval_days,
              due_at: review.due_at,
              last_reviewed_at: review.last_reviewed_at ?? null,
            })),
            { onConflict: 'user_id,card_id' },
          );
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.CardReviews, ApiTag.StudyStats],
    }),
    resetCardReviews: build.mutation<void, string[]>({
      queryFn: async (cardUuids) => {
        if (cardUuids.length === 0) return { data: undefined };
        const { error } = await supabase
          .from('card_reviews')
          .delete()
          .in('card_id', cardUuids);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.CardReviews, ApiTag.StudyStats],
    }),
    getDueCards: build.query<DueCard[], { deckUuid?: string } | undefined>({
      queryFn: async (args) => {
        const { data, error } = await supabase.rpc('get_due_cards', {
          p_deck_id: args?.deckUuid ?? null,
        });
        if (error) return supabaseError(error.message);
        return { data: (data as DueRow[]).map(mapDueCard) };
      },
      providesTags: [ApiTag.CardReviews, ApiTag.Cards],
    }),
    getDueCount: build.query<{ count: number; nextDueAt: string | null }, string | undefined>({
      queryFn: async (deckUuid) => {
        const { data, error } = await supabase.rpc('get_due_count', {
          p_deck_id: deckUuid ?? null,
        });
        if (error) return supabaseError(error.message);
        const row = data as { count: number; next_due_at: string | null };
        return { data: { count: row.count, nextDueAt: row.next_due_at } };
      },
      providesTags: [ApiTag.CardReviews, ApiTag.Cards],
    }),
    getFavorites: build.query<string[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('favorites').select('card_id');
        if (error) return supabaseError(error.message);
        return { data: (data as { card_id: string }[]).map((row) => row.card_id) };
      },
      providesTags: [ApiTag.Favorites],
    }),
    // Проверка переводов через Edge Function. Лимит запросов проверяется на сервере.
    generateChunks: build.mutation<AiChunksResult[], AiChunkInput[]>({
      queryFn: async (cards) => {
        const { data, error } = await supabase.functions.invoke('generate-chunks', {
          body: { cards },
        });
        if (error) {
          // Достаём код ошибки из тела ответа функции (например, AI_LIMIT_EXCEEDED).
          let code = error.message;
          const ctx = (error as { context?: Response }).context;
          if (ctx && typeof ctx.json === 'function') {
            try {
              const body = await ctx.json();
              if (body?.error) code = body.error;
            } catch {
              // Тело не JSON — оставляем исходное сообщение.
            }
          }
          return supabaseError(code);
        }
        const results = (data as { results?: AiChunksResult[] })?.results ?? [];
        return { data: results };
      },
      invalidatesTags: [ApiTag.AiUsage],
    }),
    checkTranslations: build.mutation<AiCheckResult[], AiCheckInput[]>({
      queryFn: async (cards) => {
        const { data, error } = await supabase.functions.invoke('check-translations', {
          body: { cards },
        });
        if (error) {
          // Достаём код ошибки из тела ответа функции (например, AI_LIMIT_EXCEEDED).
          let code = error.message;
          const ctx = (error as { context?: Response }).context;
          if (ctx && typeof ctx.json === 'function') {
            try {
              const body = await ctx.json();
              if (body?.error) code = body.error;
            } catch {
              // Тело не JSON — оставляем исходное сообщение.
            }
          }
          return supabaseError(code);
        }
        const results = (data as { results?: AiCheckResult[] })?.results ?? [];
        return { data: results };
      },
      invalidatesTags: [ApiTag.AiUsage],
    }),
    // Остаток доступных запросов к ИИ для текущего пользователя.
    getAiUsage: build.query<number, void>({
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_ai_usage');
        if (error) return supabaseError(error.message);
        return { data: (data as number | null) ?? 0 };
      },
      providesTags: [ApiTag.AiUsage],
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
  useLazyGetCardsQuery,
  useGetCardsPageQuery,
  useGetLibraryCardsQuery,
  useGetCardsCountQuery,
  useGetRecentCardsQuery,
  useCreateCardMutation,
  useCreateCardsMutation,
  useUpdateCardMutation,
  useUpdateCardsBulkMutation,
  useDeleteCardMutation,
  useDeleteCardsByDeckMutation,
  useGetCardReviewsQuery,
  useSaveCardReviewsMutation,
  useResetCardReviewsMutation,
  useGetDueCardsQuery,
  useGetDueCountQuery,
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
  useCheckTranslationsMutation,
  useGenerateChunksMutation,
  useGetAiUsageQuery,
} = cardApi;
