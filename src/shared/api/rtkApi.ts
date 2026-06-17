import { Mutex } from 'async-mutex';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { notification } from 'antd';
import { getCookie } from 'typescript-cookie';
import { IS_OLD_SAFARI } from '../const/const';
import { callAuthFailureHandler } from './authenticatedFetch';
import { getGlobalNotification } from '../lib/helpers/globalAntdApi';
import i18n from 'i18next';

export enum ApiTag {
    Notification = 'Notification',
    Notifications = 'Notifications',
    User = 'User',
    Users = 'Users',
    UserSettings = 'UserSettings',
    Deck = 'Deck',
    Decks = 'Decks',
    Card = 'Card',
    Cards = 'Cards',
    LearnProgress = 'LearnProgress',
    Favorites = 'Favorites',
}

const mutex = new Mutex();
const baseQueryWithReAuth: BaseQueryFn<
    FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock();
    const baseQuery = fetchBaseQuery({
        baseUrl: __API__,
        // Отключаем кэширование браузера для корректной работы polling
        fetchFn: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
        prepareHeaders: (headers) => {
            if (__IS_DEV__ || IS_OLD_SAFARI) {
                const token = getCookie('dev_access_token');
                if (token) {
                    headers.set('access-token', `${token}`);
                    headers.set('Authorization', `Bearer ${token}`);
                }
            }
            return headers;
        },
    });
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result?.error?.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                const { data } = await baseQuery({
                    url: '/auth/refresh-token',
                    method: 'GET',
                }, api, extraOptions);

                if (data) {
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    callAuthFailureHandler();
                }
            } finally {
                release();
            }
        } else {
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }
    }

    // Проверяем, что мы не на главной странице перед показом ошибки
    const isUnauthorized = result.error && result.error.status === 401;
    const errorDetail = result.error
        && 'data' in result.error
        && result.error.data
        && typeof result.error.data === 'object'
        && 'detail' in result.error.data
        && result.error.data.detail;
    const errorMessage = typeof errorDetail === 'string'
        ? errorDetail
        : errorDetail ? String(errorDetail) : undefined;

    if (
        result.error
        && (errorMessage || result.error.status)
        && !isUnauthorized
    ) {
        // Используем глобальный API для наследования темы, или fallback на статический
        const notificationApi = getGlobalNotification() ?? notification;
        let message = errorMessage ? i18n.t(errorMessage) : `Error status: ${result.error.status}`;

        if (result.error.status === 502) {
            message = i18n.t('Сервис временно недоступен. Попробуйте позже.');
        }

        // notificationApi.error({
        //     message,
        // });
    }
    return result;
};

export const rtkApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReAuth,
    tagTypes: Object.values(ApiTag),
    endpoints: (_builder) => ({}),
});