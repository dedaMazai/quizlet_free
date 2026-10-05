import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';
import { NetworkBanner } from '@/widgets/NetworkBanner';
import { PageLoader } from '@/widgets/PageLoader';
import cls from './FocusLayout.module.scss';

/** Оболочка занятий: без сайдбара и шапки, топбар рисует сама сессия */
export const FocusLayout = () => {
    const { pathname } = useLocation();

    return (
        <main className={cls.FocusLayout}>
            <NetworkBanner />
            <Suspense key={pathname} fallback={<PageLoader />}>
                <Outlet />
            </Suspense>
        </main>
    );
};
