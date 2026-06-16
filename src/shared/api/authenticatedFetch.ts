import { Mutex } from 'async-mutex';
import { getCookie } from 'typescript-cookie';
import { IS_OLD_SAFARI } from '../const/const';

const mutex = new Mutex();

let authFailureHandler: (() => void) | null = null;

/**
 * Registers a callback invoked when token refresh fails (401 after refresh attempt).
 * Call once at app initialization — e.g. in StoreProvider — to dispatch logout.
 */
export const setAuthFailureHandler = (handler: () => void): void => {
    authFailureHandler = handler;
};

export const callAuthFailureHandler = (): void => authFailureHandler?.();

function buildAuthHeaders(isFormData: boolean): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (__IS_DEV__ || IS_OLD_SAFARI) {
        const token = getCookie('dev_access_token');
        if (token) {
            headers['access-token'] = token;
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
}

async function doFetch(url: string, init?: RequestInit): Promise<Response> {
    const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
    return fetch(url, {
        ...init,
        headers: { ...buildAuthHeaders(isFormData), ...init?.headers },
        credentials: 'include',
        cache: 'no-store',
    });
}

/**
 * Authorised fetch that mirrors rtkApiChats auth logic:
 * - Sets access-token + Authorization headers (dev / old Safari only)
 * - Attempts a token refresh on 401 before propagating the error
 * - Mutex-protected to prevent concurrent refresh races
 */
export async function authenticatedFetch(
    baseUrl: string,
    path: string,
    init?: RequestInit,
    refreshBaseUrl?: string,
): Promise<Response> {
    await mutex.waitForUnlock();

    const url = `${baseUrl}${path}`;
    const response = await doFetch(url, init);

    if (response.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                const refreshUrl = `${refreshBaseUrl ?? baseUrl}/auth/refresh-token`;
                const refreshResponse = await doFetch(refreshUrl, { method: 'GET' });
                if (refreshResponse.ok) {
                    return doFetch(url, init);
                } else {
                    authFailureHandler?.();
                }
            } finally {
                release();
            }
        } else {
            // Another request is already refreshing — wait for it, then retry with the new token
            await mutex.waitForUnlock();
            return doFetch(url, init);
        }
    }

    return response;
}
