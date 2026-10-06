import { rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError } from '@/shared/api/supabaseClient';

// RPC delete_my_account (supabase/privacy.sql) удаляет auth.users — каскадом уходят все данные.
const deleteAccountApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        deleteMyAccount: build.mutation<void, void>({
            queryFn: async () => {
                const { error } = await supabase.rpc('delete_my_account');
                if (error) return supabaseError(error.message);
                return { data: undefined };
            },
        }),
    }),
});

export const { useDeleteMyAccountMutation } = deleteAccountApi;
