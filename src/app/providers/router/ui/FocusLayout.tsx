import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';
import { LegalConsentGate } from '@/widgets/LegalConsentGate';
import { NetworkBanner } from '@/widgets/NetworkBanner';
import { PageLoader } from '@/widgets/PageLoader';
import cls from './FocusLayout.module.scss';

/** Оболочка занятий: без сайдбара и шапки, топбар рисует сама сессия */
export const FocusLayout = () => {
    const { pathname } = useLocation();

    return (
        <main className={cls.FocusLayout}>
            <NetworkBanner />
            <LegalConsentGate />
            <Suspense key={pathname} fallback={<PageLoader />}>
                {/* Анимируется только контент: оболочка неподвижна */}
                <div className={cls.page}>
                    <Outlet />
                </div>
            </Suspense>
        </main>
    );
};
