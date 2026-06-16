import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';
import * as Sentry from '@sentry/react';
import { useUserActions, useUserInfoQuery, useUserInited, useUserLoggedOut, useCheckOidcMutation } from '@/entities/User';
import { checkIsPublicPage } from '@/shared/config/router/routePath';

export const useUserInit = () => {
    const location = useLocation();
    const inited = useUserInited();
    const { initUserData } = useUserActions();

    const isPublicPage = useMemo(() => checkIsPublicPage(location.pathname), [location.pathname]);
    const loggedOut = useUserLoggedOut();

    const { error: userInfoError, refetch: refetchUserInfo } = useUserInfoQuery();
    const [checkOidc] = useCheckOidcMutation({ fixedCacheKey: 'init-oidc-check' });

    const oidcAttempted = useRef(false);
    const loggedOutRef = useRef(loggedOut);
    loggedOutRef.current = loggedOut;

    useEffect(() => {
        if (isPublicPage && !inited) {
            try {
                initUserData();
            } catch (error) {
                console.error('Failed to initialize user data:', error);
                Sentry.captureException(error);
            }
        }
    }, [initUserData, inited, isPublicPage]);

    useEffect(() => {
        const alreadyTriedOidc = new URLSearchParams(window.location.search).has('oidc_error');

        if (
            userInfoError && 'status' in userInfoError
            && userInfoError.status === 401
            && !oidcAttempted.current
            && !alreadyTriedOidc
            && !loggedOutRef.current
            && !__IS_DEV__
        ) {
            oidcAttempted.current = true;
            checkOidc()
                .unwrap()
                .then((data) => {
                    window.location.href = data.authorization_url;
                })
                .catch(() => {
                    refetchUserInfo();
                });
        }
    }, [userInfoError, checkOidc, refetchUserInfo]);

    useEffect(() => {
        if (userInfoError && !('status' in userInfoError && userInfoError.status === 401)) {
            console.error('User info query error:', userInfoError);
        }
    }, [userInfoError]);
};
