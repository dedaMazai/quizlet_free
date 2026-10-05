import { Suspense, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { BrowserView, MobileView } from 'react-device-detect';
import { PageLoader } from '@/widgets/PageLoader';
import { Sidebar } from '@/widgets/Sidebar';
import { Topbar } from '@/widgets/Topbar';
import { Navbar } from '@/widgets/Navbar';
import { FocusModeProvider, useFocusModeActive } from '@/shared/lib/focusMode';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './AuthLayout.module.scss';

interface AuthLayoutProps {
    withSidebar?: boolean;
}

const AuthLayoutContent = ({ withSidebar = true }: AuthLayoutProps) => {
    const location = useLocation();
    // Повторение запускает сессию без смены URL — оболочка прячется по флагу страницы
    const focus = useFocusModeActive();
    const stableKey = useMemo(
        () => location.pathname.replace(/\/revisions\/[^/]+$/, ''),
        [location.pathname],
    );

    return (
        <div className={cls.AuthLayout}>
            {withSidebar && !focus && <Sidebar />}
            <div className={cls.column}>
                {!focus && (
                    <>
                        <BrowserView renderWithFragment>
                            <Topbar />
                        </BrowserView>
                        <MobileView renderWithFragment>
                            <Navbar />
                        </MobileView>
                    </>
                )}
                <main className={classNames(cls.main, { [cls.focus]: focus })}>
                    <Suspense key={stableKey} fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export const AuthLayout = (props: AuthLayoutProps) => (
    <FocusModeProvider>
        <AuthLayoutContent {...props} />
    </FocusModeProvider>
);
