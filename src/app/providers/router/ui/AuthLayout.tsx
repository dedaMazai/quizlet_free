import { Suspense, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { BrowserView, MobileView } from 'react-device-detect';
import { PageLoader } from '@/widgets/PageLoader';
import { Sidebar } from '@/widgets/Sidebar';
import { Topbar } from '@/widgets/Topbar';
import { Navbar } from '@/widgets/Navbar';
import cls from './AuthLayout.module.scss';

interface AuthLayoutProps {
    withSidebar?: boolean;
}

export const AuthLayout = ({ withSidebar = true }: AuthLayoutProps) => {
    const location = useLocation();
    const stableKey = useMemo(
        () => location.pathname.replace(/\/revisions\/[^/]+$/, ''),
        [location.pathname],
    );

    return (
        <div className={cls.AuthLayout}>
            {withSidebar && <Sidebar />}
            <div className={cls.column}>
                <BrowserView renderWithFragment>
                    <Topbar />
                </BrowserView>
                <MobileView renderWithFragment>
                    <Navbar />
                </MobileView>
                <main className={cls.main}>
                    <Suspense key={stableKey} fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
};
