import { memo } from 'react';
import { Outlet } from 'react-router';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useUserInited } from '@/entities/User';
import { PageLoader } from '@/widgets/PageLoader';
import { useNotificationWebsocket } from '@/entities/Notifications';
import { useUserInit } from '../entities/User/model/hooks/useUserInit';

export const App = memo(() => {
    const inited = useUserInited();

    useUserInit();
    useNotificationWebsocket();

    return (
        <div id="app" className={classNames('app')}>
            {inited ? <Outlet /> : <PageLoader />}
        </div>
    );
});
