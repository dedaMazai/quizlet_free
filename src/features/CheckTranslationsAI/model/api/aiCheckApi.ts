import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError } from '@/shared/api/supabaseClient';
import { AiCheckInput, AiCheckResult } from '../types/aiCheck';

const aiCheckApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    // Проверка переводов через Edge Function. Лимит запросов проверяется на сервере.
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
  }),
});

export const { useCheckTranslationsMutation, useGetAiUsageQuery } = aiCheckApi;
