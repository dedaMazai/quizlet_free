import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError, getCurrentUserId } from '@/shared/api/supabaseClient';
import { DEFAULT_DAILY_GOAL } from '@/shared/const/const';

/** Настройки пользователя в Supabase (`user_preferences`), в отличие от старого REST user-settings. */
export interface UserPreferences {
    dailyGoal: number;
}

interface UserPreferencesRow {
    daily_goal: number;
}

const userPreferencesApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getUserPreferences: build.query<UserPreferences, void>({
            queryFn: async () => {
                // RLS отдаёт только свою строку; строки нет, пока настройки не меняли
                const { data, error } = await supabase
                    .from('user_preferences')
                    .select('daily_goal')
                    .maybeSingle();
                if (error) return supabaseError(error.message);
                const row = data as UserPreferencesRow | null;
                return { data: { dailyGoal: row?.daily_goal ?? DEFAULT_DAILY_GOAL } };
            },
            providesTags: [ApiTag.UserPreferences],
        }),
        updateUserPreferences: build.mutation<void, UserPreferences>({
            queryFn: async ({ dailyGoal }) => {
                const userId = await getCurrentUserId();
                if (!userId) return supabaseError('Not authenticated');
                const { error } = await supabase
                    .from('user_preferences')
                    .upsert(
                        { user_id: userId, daily_goal: dailyGoal, updated_at: new Date().toISOString() },
                        { onConflict: 'user_id' },
                    );
                if (error) return supabaseError(error.message);
                return { data: undefined };
            },
            // Сразу показываем новую цель, не дожидаясь перезапроса
            async onQueryStarted(preferences, { dispatch, queryFulfilled }) {
                const patch = dispatch(userPreferencesApi.util.updateQueryData(
                    'getUserPreferences',
                    undefined,
                    () => preferences,
                ));
                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
            invalidatesTags: [ApiTag.UserPreferences],
        }),
    }),
});

export const { useGetUserPreferencesQuery, useUpdateUserPreferencesMutation } = userPreferencesApi;
