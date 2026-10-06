import { memo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useUserInited } from '@/entities/User';
import { PageLoader } from '@/widgets/PageLoader';
import { useNotificationsRealtime } from '@/entities/Notifications';
import { useTelegramBackButton } from '@/shared/lib/telegram';
import { hasStoredSession } from '@/shared/api/supabaseClient';
import { checkIsGuestPage } from '@/shared/config/router/indexablePages';
import { useUserInit } from '../entities/User/model/hooks/useUserInit';

export const App = memo(() => {
    const inited = useUserInited();
    const { pathname } = useLocation();
    // Гость на публичной странице видит её сразу, без ожидания проверки сессии:
    // так пререндеренный HTML сменяется той же разметкой, без лоадера
    const ready = inited || (checkIsGuestPage(pathname) && !hasStoredSession());

    useUserInit();
    useNotificationsRealtime();
    useTelegramBackButton();

    return (
        <div id="app" className={classNames('app')}>
            {ready ? <Outlet /> : <PageLoader />}
        </div>
    );
});
