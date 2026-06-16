import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import {
    useGetUserSettingsQuery,
    useUpdateUserSettingsMutation,
    useCreateUserSettingsMutation,
    ViewSettingsData
} from '../api/userSettingsApi';

const LOCAL_STORAGE_VIEW_DATA_KEY = 'user_view_data';

interface UseUserSettingsDataReturn {
    viewData: ViewSettingsData;
    isLoading: boolean;
    error: string | null;
    updateViewData: (data: Partial<Record<string, any>>) => void;
    setViewData: (data: ViewSettingsData) => void;
}

export const useUserSettingsData = (): UseUserSettingsDataReturn => {
    const [localViewData, setLocalViewData] = useLocalStorage<ViewSettingsData>(
        LOCAL_STORAGE_VIEW_DATA_KEY,
        {}
    );

    const {
        data: userSettings,
        isLoading: isLoadingSettings,
        error: fetchError
    } = useGetUserSettingsQuery();

    const [updateUserSettings, {
        isLoading: isUpdating,
        error: updateError
    }] = useUpdateUserSettingsMutation();

    const [createUserSettings, {
        isLoading: isCreating,
        error: createError
    }] = useCreateUserSettingsMutation();

    const currentViewData = useMemo(() => {
        const apiViewData = userSettings?.view_data;

        if (apiViewData) {
            const mergedData = { ...localViewData, ...apiViewData };

            if (JSON.stringify(mergedData) !== JSON.stringify(localViewData)) {
                setLocalViewData(mergedData);
            }

            return mergedData;
        }

        return localViewData;
    }, [userSettings?.view_data, localViewData, setLocalViewData]);

    const isLoading = isLoadingSettings || isUpdating || isCreating;

    const error = useMemo(() => {
        const errors = [fetchError, updateError, createError].filter(Boolean);
        if (errors.length > 0) {
            const errorWithMessage = errors.find(err => err && 'message' in err);
            if (errorWithMessage && 'message' in errorWithMessage) {
                return errorWithMessage.message as string;
            }
            return 'An error occurred while managing user settings data';
        }
        return null;
    }, [fetchError, updateError, createError]);

    const updateViewData = useCallback(async (partialData: Partial<Record<string, any>>) => {
        const newViewData = { ...currentViewData, ...partialData };

        setLocalViewData(newViewData);

        try {
            if (userSettings) {
                await updateUserSettings({
                    view_data: newViewData
                }).unwrap();
            } else {
                await createUserSettings({
                    theme: 'light', // Default theme
                    view_data: newViewData
                }).unwrap();
            }
        } catch (apiError) {
            console.warn('Failed to sync view data to server:', apiError);
        }
    }, [currentViewData, setLocalViewData, userSettings, updateUserSettings, createUserSettings]);

    const setViewData = useCallback(async (newViewData: ViewSettingsData) => {
        setLocalViewData(newViewData);

        try {
            if (userSettings) {
                await updateUserSettings({
                    view_data: newViewData
                }).unwrap();
            } else {
                await createUserSettings({
                    theme: 'light', // Default theme
                    view_data: newViewData
                }).unwrap();
            }
        } catch (apiError) {
            console.warn('Failed to sync view data to server:', apiError);
        }
    }, [setLocalViewData, userSettings, updateUserSettings, createUserSettings]);

    return {
        viewData: currentViewData,
        isLoading,
        error,
        updateViewData,
        setViewData,
    };
};

