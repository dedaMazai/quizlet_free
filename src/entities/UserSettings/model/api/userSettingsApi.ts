import { ApiTag, rtkApi } from '@/shared/api/rtkApi';

export type ViewSettingsData = Record<string, any>;

export type ThemeUserSettings = 'light' | 'dark';

export interface UserSettingsForm {
    uuid: string;
    created_at?: string;
    updated_at?: string;
    theme: ThemeUserSettings;
    allow_email_notification: boolean;
    allow_sms_notification: boolean;
    allow_web_notification: boolean;
    view_data: ViewSettingsData;
    user_uuid: string;
}

export interface CreateUserSettingsRequest {
    theme?: ThemeUserSettings;
    view_data?: ViewSettingsData;
    allow_email_notification?: boolean;
    allow_sms_notification?: boolean;
    allow_web_notification?: boolean;
}

export interface UpdateUserSettingsRequest {
    theme?: ThemeUserSettings | null;
    view_data?: ViewSettingsData;
    allow_email_notification?: boolean | null;
    allow_sms_notification?: boolean | null;
    allow_web_notification?: boolean | null;
}

const userSettingsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getUserSettings: build.query<UserSettingsForm | null, void>({
            query: () => ({
                url: '/user-settings/me',
                method: 'GET',
            }),
            providesTags: [ApiTag.UserSettings],
        }),
        createUserSettings: build.mutation<UserSettingsForm, CreateUserSettingsRequest>({
            query: (body) => ({
                url: '/user-settings/me',
                method: 'POST',
                body,
            }),
            invalidatesTags: [ApiTag.UserSettings],
        }),
        updateUserSettings: build.mutation<UserSettingsForm, UpdateUserSettingsRequest>({
            query: (body) => ({
                url: '/user-settings/me',
                method: 'PUT',
                body,
            }),
            invalidatesTags: [ApiTag.UserSettings],
        }),
        deleteUserSettings: build.mutation<void, void>({
            query: () => ({
                url: '/user-settings/me',
                method: 'DELETE',
            }),
            invalidatesTags: [ApiTag.UserSettings],
        }),
    }),
});

export const {
    useGetUserSettingsQuery,
    useCreateUserSettingsMutation,
    useUpdateUserSettingsMutation,
    useDeleteUserSettingsMutation,
} = userSettingsApi;
