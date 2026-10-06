import { rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError } from '@/shared/api/supabaseClient';

// Согласия хранятся в public.user_consents (supabase/privacy.sql): пишут только
// триггер регистрации и RPC accept_legal_documents, клиент читает итог через has_accepted_legal.
const legalConsentApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        // Принял ли текущий пользователь документы этой редакции
        hasAcceptedLegal: build.query<boolean, string>({
            queryFn: async (version) => {
                const { data, error } = await supabase.rpc('has_accepted_legal', { p_version: version });
                if (error) return supabaseError(error.message);
                return { data: Boolean(data) };
            },
        }),
        acceptLegalDocuments: build.mutation<void, string>({
            queryFn: async (version) => {
                const { error } = await supabase.rpc('accept_legal_documents', { p_version: version });
                if (error) return supabaseError(error.message);
                return { data: undefined };
            },
            // Тегов у согласий нет: после принятия кладём ответ в кэш проверки напрямую
            async onQueryStarted(version, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(legalConsentApi.util.upsertQueryData('hasAcceptedLegal', version, true));
                } catch {
                    // Ошибку показывает вызывающий компонент
                }
            },
        }),
    }),
});

export const {
    useHasAcceptedLegalQuery,
    useAcceptLegalDocumentsMutation,
} = legalConsentApi;
