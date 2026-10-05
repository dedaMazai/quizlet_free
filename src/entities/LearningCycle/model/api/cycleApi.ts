import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError } from '@/shared/api/supabaseClient';
import {
  CycleCreateDto,
  CyclePortionSyncDto,
  CycleUpdateDto,
  CycleWord,
  CycleWordPortion,
  CycleWordsAddDto,
  CycleWordsReorderDto,
  CycleWordUpdateDto,
  LearningCycle,
} from '../types/cycle';

// Строка таблицы learning_cycles (RLS отдаёт только циклы текущего пользователя).
interface CycleRow {
  id: string;
  name: string;
  daily_new_count: number;
  current_portion: number;
  portion_date: string | null;
  start_word_id: string | null;
  words: { count: number }[] | null;
  created_at: string;
  updated_at: string;
}

interface CycleWordRow {
  id: string;
  cycle_id: string;
  term: string;
  translation: string;
  position: number;
  portion: number | null;
  is_important: boolean;
  created_at: string;
}

// Связей между таблицами две (cycle_id и start_word_id) — embed указываем явно по FK.
const CYCLE_SELECT = '*, words:learning_cycle_words!learning_cycle_words_cycle_id_fkey(count)';

const mapCycle = (row: CycleRow): LearningCycle => ({
  uuid: row.id,
  name: row.name,
  daily_new_count: row.daily_new_count,
  current_portion: row.current_portion,
  portion_date: row.portion_date,
  start_word_uuid: row.start_word_id,
  words_count: row.words?.[0]?.count ?? 0,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const mapWord = (row: CycleWordRow): CycleWord => ({
  uuid: row.id,
  cycle_uuid: row.cycle_id,
  term: row.term,
  translation: row.translation,
  position: row.position,
  portion: row.portion,
  is_important: row.is_important,
  created_at: row.created_at,
});

const cycleApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    getCycles: build.query<LearningCycle[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('learning_cycles')
          .select(CYCLE_SELECT)
          .order('created_at', { ascending: true });
        if (error) return supabaseError(error.message);
        return { data: (data as CycleRow[]).map(mapCycle) };
      },
      // Порцию открывает sync_cycle_portion — он инвалидирует только тег своего цикла.
      providesTags: (result) => [
        ApiTag.LearningCycles,
        ...(result ?? []).map((cycle) => ({ type: ApiTag.LearningCycle, id: cycle.uuid })),
      ],
    }),
    // Порции слов всех циклов — для карточек списка, без N запросов слов.
    getCyclesWordPortions: build.query<Record<string, CycleWordPortion[]>, void>({
      queryFn: async () => {
        const PAGE_SIZE = 1000;
        const byCycle: Record<string, CycleWordPortion[]> = {};
        for (let from = 0; ; from += PAGE_SIZE) {
          const { data, error } = await supabase
            .from('learning_cycle_words')
            .select('id, cycle_id, portion')
            .order('id', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);
          if (error) return supabaseError(error.message);
          const page = data as Pick<CycleWordRow, 'id' | 'cycle_id' | 'portion'>[];
          page.forEach((row) => {
            (byCycle[row.cycle_id] ??= []).push({ uuid: row.id, portion: row.portion });
          });
          if (page.length < PAGE_SIZE) break;
        }
        return { data: byCycle };
      },
      providesTags: (result) => [
        ApiTag.LearningCycles,
        ...Object.keys(result ?? {}).map((uuid) => ({ type: ApiTag.LearningCycleWords, id: uuid })),
      ],
    }),
    getCycle: build.query<LearningCycle | undefined, string>({
      queryFn: async (uuid) => {
        const { data, error } = await supabase
          .from('learning_cycles')
          .select(CYCLE_SELECT)
          .eq('id', uuid)
          .maybeSingle();
        if (error) return supabaseError(error.message);
        return { data: data ? mapCycle(data as CycleRow) : undefined };
      },
      providesTags: (_result, _error, uuid) => [{ type: ApiTag.LearningCycle, id: uuid }],
    }),
    createCycle: build.mutation<LearningCycle, CycleCreateDto>({
      queryFn: async (dto) => {
        const { data, error } = await supabase
          .from('learning_cycles')
          .insert({ name: dto.name, daily_new_count: dto.daily_new_count })
          .select(CYCLE_SELECT)
          .single();
        if (error) return supabaseError(error.message);
        return { data: mapCycle(data as CycleRow) };
      },
      invalidatesTags: [ApiTag.LearningCycles],
    }),
    updateCycle: build.mutation<LearningCycle, CycleUpdateDto>({
      queryFn: async ({ uuid, start_word_uuid: startWordUuid, ...fields }) => {
        const { data, error } = await supabase
          .from('learning_cycles')
          .update({
            ...fields,
            ...(startWordUuid !== undefined && { start_word_id: startWordUuid }),
            updated_at: new Date().toISOString(),
          })
          .eq('id', uuid)
          .select(CYCLE_SELECT)
          .single();
        if (error) return supabaseError(error.message);
        return { data: mapCycle(data as CycleRow) };
      },
      invalidatesTags: (_result, _error, dto) => [
        ApiTag.LearningCycles,
        { type: ApiTag.LearningCycle, id: dto.uuid },
      ],
    }),
    deleteCycle: build.mutation<void, string>({
      queryFn: async (uuid) => {
        // Слова цикла удаляются каскадом (FK on delete cascade).
        const { error } = await supabase.from('learning_cycles').delete().eq('id', uuid);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.LearningCycles],
    }),
    // Открытие сегодняшней порции слов (новый день / долив / «Новый день»).
    syncCyclePortion: build.mutation<void, CyclePortionSyncDto>({
      queryFn: async ({ cycleUuid, today, forceNew = false }) => {
        const { error } = await supabase.rpc('sync_cycle_portion', {
          p_cycle_id: cycleUuid,
          p_today: today,
          p_force_new: forceNew,
        });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: (_result, _error, dto) => [
        { type: ApiTag.LearningCycle, id: dto.cycleUuid },
        { type: ApiTag.LearningCycleWords, id: dto.cycleUuid },
      ],
    }),
    getCycleWords: build.query<CycleWord[], string>({
      queryFn: async (cycleUuid) => {
        // PostgREST отдаёт максимум 1000 строк за запрос — выбираем все постранично.
        const PAGE_SIZE = 1000;
        const rows: CycleWordRow[] = [];
        for (let from = 0; ; from += PAGE_SIZE) {
          const { data, error } = await supabase
            .from('learning_cycle_words')
            .select('*')
            .eq('cycle_id', cycleUuid)
            .order('position', { ascending: true })
            .order('created_at', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);
          if (error) return supabaseError(error.message);
          const page = data as CycleWordRow[];
          rows.push(...page);
          if (page.length < PAGE_SIZE) break;
        }
        return { data: rows.map(mapWord) };
      },
      providesTags: (_result, _error, cycleUuid) => [{ type: ApiTag.LearningCycleWords, id: cycleUuid }],
    }),
    // Добавление слов в конец списка цикла.
    addCycleWords: build.mutation<void, CycleWordsAddDto>({
      queryFn: async ({ cycleUuid, words }) => {
        const { data: last, error: lastError } = await supabase
          .from('learning_cycle_words')
          .select('position')
          .eq('cycle_id', cycleUuid)
          .order('position', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastError) return supabaseError(lastError.message);
        const base = last ? (last as { position: number }).position + 1 : 0;
        const { error } = await supabase.from('learning_cycle_words').insert(
          words.map((word, i) => ({
            cycle_id: cycleUuid,
            term: word.term.trim(),
            translation: word.translation.trim(),
            position: base + i,
          })),
        );
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: (_result, _error, dto) => [
        ApiTag.LearningCycles,
        { type: ApiTag.LearningCycle, id: dto.cycleUuid },
        { type: ApiTag.LearningCycleWords, id: dto.cycleUuid },
      ],
    }),
    updateCycleWord: build.mutation<void, CycleWordUpdateDto>({
      queryFn: async ({ uuid, cycleUuid: _cycleUuid, ...fields }) => {
        const { error } = await supabase.from('learning_cycle_words').update(fields).eq('id', uuid);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      // Оптимистично: звёздочка «важное» и правка слова видны сразу.
      onQueryStarted: async ({ uuid, cycleUuid, ...fields }, { dispatch, queryFulfilled }) => {
        const patch = dispatch(cycleApi.util.updateQueryData('getCycleWords', cycleUuid, (draft) => {
          const word = draft.find((w) => w.uuid === uuid);
          if (word) Object.assign(word, fields);
        }));
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    deleteCycleWord: build.mutation<void, { uuid: string; cycleUuid: string }>({
      queryFn: async ({ uuid }) => {
        const { error } = await supabase.from('learning_cycle_words').delete().eq('id', uuid);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: (_result, _error, dto) => [
        ApiTag.LearningCycles,
        { type: ApiTag.LearningCycle, id: dto.cycleUuid },
        { type: ApiTag.LearningCycleWords, id: dto.cycleUuid },
      ],
    }),
    reorderCycleWords: build.mutation<void, CycleWordsReorderDto>({
      queryFn: async ({ cycleUuid, wordUuids }) => {
        const { error } = await supabase.rpc('reorder_cycle_words', {
          p_cycle_id: cycleUuid,
          p_word_ids: wordUuids,
        });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      // Оптимистично, иначе перетащенная строка «прыгает» назад до ответа сервера.
      onQueryStarted: async ({ cycleUuid, wordUuids }, { dispatch, queryFulfilled }) => {
        const patch = dispatch(cycleApi.util.updateQueryData('getCycleWords', cycleUuid, (draft) => {
          const byUuid = new Map(draft.map((w) => [w.uuid, w]));
          return wordUuids.flatMap((uuid, position) => {
            const word = byUuid.get(uuid);
            return word ? [{ ...word, position }] : [];
          });
        }));
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetCyclesQuery,
  useGetCyclesWordPortionsQuery,
  useGetCycleQuery,
  useCreateCycleMutation,
  useUpdateCycleMutation,
  useDeleteCycleMutation,
  useSyncCyclePortionMutation,
  useGetCycleWordsQuery,
  useAddCycleWordsMutation,
  useUpdateCycleWordMutation,
  useDeleteCycleWordMutation,
  useReorderCycleWordsMutation,
} = cycleApi;
