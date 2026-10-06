import { Suspense, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { LegalConsentGate } from '@/widgets/LegalConsentGate';
import { NetworkBanner } from '@/widgets/NetworkBanner';
import { PageLoader } from '@/widgets/PageLoader';
import { Sidebar } from '@/widgets/Sidebar';
import { TabBar } from '@/widgets/TabBar';
import { Topbar } from '@/widgets/Topbar';
import { FocusModeProvider, useFocusModeActive } from '@/shared/lib/focusMode';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './AuthLayout.module.scss';

interface AuthLayoutProps {
    withSidebar?: boolean;
}

const AuthLayoutContent = ({ withSidebar = true }: AuthLayoutProps) => {
    const location = useLocation();
    // Повторение запускает сессию без смены URL — оболочка прячется по флагу страницы
    const focus = useFocusModeActive();
    // Мобильная оболочка: без сайдбара и топбара, внизу таб-бар (Mobile 6.35)
    const { isMobile } = useMatchMedia();
    const stableKey = useMemo(
        () => location.pathname.replace(/\/revisions\/[^/]+$/, ''),
        [location.pathname],
    );

    return (
        <div className={cls.AuthLayout}>
            {withSidebar && !focus && !isMobile && <Sidebar />}
            <div className={cls.column}>
                {!focus && !isMobile && <Topbar />}
                <NetworkBanner />
                <LegalConsentGate />
                <main className={classNames(cls.main, { [cls.focus]: focus })}>
                    <Suspense key={stableKey} fallback={<PageLoader />}>
                        {/* Анимируется только контент: оболочка неподвижна */}
                        <div className={cls.page}>
                            <Outlet />
                        </div>
                    </Suspense>
                </main>
                {withSidebar && !focus && isMobile && <TabBar />}
            </div>
        </div>
    );
};

export const AuthLayout = (props: AuthLayoutProps) => (
    <FocusModeProvider>
        <AuthLayoutContent {...props} />
    </FocusModeProvider>
);
