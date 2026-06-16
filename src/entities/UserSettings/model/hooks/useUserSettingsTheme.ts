import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { LOCAL_STORAGE_THEME_KEY } from '@/shared/const/localstorage';
import { Theme } from '@/shared/const/theme';
import {
    useGetUserSettingsQuery,
    useUpdateUserSettingsMutation,
    ThemeUserSettings,
    useCreateUserSettingsMutation
} from '../api/userSettingsApi';
import { useUserInfo } from '@/entities/User';

const themeToApiMapping: Record<Theme, ThemeUserSettings> = {
    [Theme.LIGHT]: 'light',
    [Theme.DARK]: 'dark',
};

const apiToThemeMapping: Record<ThemeUserSettings, Theme> = {
    'light': Theme.LIGHT,
    'dark': Theme.DARK,
};

interface UseUserSettingsThemeReturn {
    theme: Theme;
    isLoading: boolean;
    error: string | null;
    setTheme: (theme: Theme) => void;
}


export const useUserSettingsTheme = (): UseUserSettingsThemeReturn => {
    const [localTheme, setLocalTheme] = useLocalStorage<Theme>(
        LOCAL_STORAGE_THEME_KEY,
        Theme.LIGHT
    );
    const userInfo = useUserInfo();

    const {
        data: userSettings,
        isFetching: isFetchingSettings,
        error: fetchError
    } = useGetUserSettingsQuery(undefined, {
        skip: !userInfo,
    });

    const [updateUserSettings, {
        isLoading: isUpdating,
        error: updateError
    }] = useUpdateUserSettingsMutation();

    const [createUserSettings, {
        isLoading: isCreating,
        error: createError
    }] = useCreateUserSettingsMutation();

    const currentTheme = useMemo(() => {
        if (userSettings?.theme) {
            const mappedTheme = apiToThemeMapping[userSettings.theme];

            if (mappedTheme !== localTheme) {
                setLocalTheme(mappedTheme);
            }
            return mappedTheme;
        }
        return localTheme;
    }, [userSettings?.theme, localTheme, setLocalTheme]);

    const isLoading = isFetchingSettings || isUpdating || isCreating;

    const error = useMemo(() => {
        if (fetchError && 'message' in fetchError) {
            return fetchError.message as string;
        }
        if (updateError && 'message' in updateError) {
            return updateError.message as string;
        }
        if (createError && 'message' in createError) {
            return createError.message as string;
        }
        if (fetchError || updateError || createError) {
            return 'An error occurred while managing theme settings';
        }
        return null;
    }, [fetchError, updateError, createError]);

    const setTheme = useCallback(async (newTheme: Theme) => {
        setLocalTheme(newTheme);

        try {
            const update = userSettings ? updateUserSettings : createUserSettings;
                await update({
                    theme: themeToApiMapping[newTheme]
                }).unwrap();
        } catch (apiError) {
            console.warn('Failed to sync theme to server:', apiError);
        }
    }, [setLocalTheme, updateUserSettings, createUserSettings, userSettings]);

    return {
        theme: currentTheme,
        isLoading,
        error,
        setTheme,
    };
};

