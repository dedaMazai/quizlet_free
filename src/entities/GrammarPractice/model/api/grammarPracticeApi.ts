import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError } from '@/shared/api/supabaseClient';
import {
    AiCheckResponse, AiCheckResultItem, CheckAnswersItem, GenerateExercisesArgs, PracticeTask, TenseMasteryRow,
} from '../types/grammarPractice';
import {
    TENSE_MASTERY_TICKS, TenseAnswer, TenseMastery, findTenseId,
} from '../lib/tenseMastery';

// Достаёт код ошибки из тела ответа Edge Function (например, AI_LIMIT_EXCEEDED).
const extractErrorCode = async (error: Error): Promise<string> => {
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
    return code;
};

const grammarPracticeApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        generateGrammarExercises: build.mutation<PracticeTask[], GenerateExercisesArgs>({
            queryFn: async ({ tenses, count }) => {
                const { data, error } = await supabase.functions.invoke('grammar-practice', {
                    body: { action: 'generate', tenses, count },
                });
                if (error) return supabaseError(await extractErrorCode(error));
                const exercises = (data as { exercises?: PracticeTask[] })?.exercises ?? [];
                return { data: exercises };
            },
            invalidatesTags: [ApiTag.AiUsage],
        }),
        checkGrammarAnswers: build.mutation<AiCheckResponse, CheckAnswersItem[]>({
            queryFn: async (items) => {
                const { data, error } = await supabase.functions.invoke('grammar-practice', {
                    body: { action: 'check', items },
                });
                if (error) return supabaseError(await extractErrorCode(error));
                const results = (data as { results?: AiCheckResultItem[] })?.results ?? [];
                const advice = (data as { advice?: string })?.advice ?? '';
                return { data: { results, advice } };
            },
            invalidatesTags: [ApiTag.AiUsage],
        }),
        getTenseMastery: build.query<TenseMastery, void>({
            queryFn: async () => {
                const { data, error } = await supabase.rpc('get_tense_mastery', { p_window: TENSE_MASTERY_TICKS });
                if (error) return supabaseError(error.message);
                const rows = (data as TenseMasteryRow[]) ?? [];
                return { data: Object.fromEntries(rows.map((row) => [row.tense_id, row.score])) };
            },
            providesTags: [ApiTag.GrammarResults],
        }),
        saveTenseAnswers: build.mutation<void, TenseAnswer[]>({
            queryFn: async (answers) => {
                // Ответы с неизвестным временем (ИИ назвал его иначе) в освоенность не идут
                const rows = answers.flatMap(({ tense, ok }) => {
                    const tenseId = findTenseId(tense);
                    return tenseId ? [{ tense_id: tenseId, is_correct: ok }] : [];
                });
                if (rows.length === 0) return { data: undefined };
                const { error } = await supabase.from('grammar_results').insert(rows);
                if (error) return supabaseError(error.message);
                return { data: undefined };
            },
            invalidatesTags: [ApiTag.GrammarResults],
        }),
    }),
});

export const {
    useGenerateGrammarExercisesMutation,
    useCheckGrammarAnswersMutation,
    useGetTenseMasteryQuery,
    useSaveTenseAnswersMutation,
} = grammarPracticeApi;
