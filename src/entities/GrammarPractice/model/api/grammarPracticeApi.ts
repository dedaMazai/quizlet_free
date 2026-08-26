import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError } from '@/shared/api/supabaseClient';
import {
    AiCheckResponse, AiCheckResultItem, CheckAnswersItem, GenerateExercisesArgs, PracticeTask,
} from '../types/grammarPractice';

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
    }),
});

export const {
    useGenerateGrammarExercisesMutation,
    useCheckGrammarAnswersMutation,
} = grammarPracticeApi;
