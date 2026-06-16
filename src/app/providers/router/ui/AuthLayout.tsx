import { Suspense, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { PageLoader } from '@/widgets/PageLoader';
import { Sidebar } from '@/widgets/Sidebar';
import { Navbar } from '@/widgets/Navbar';
import { HStack, VStack } from '@/shared/ui/Stack';

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
        <HStack max fullHeight align="start">
            {withSidebar && <Sidebar />}
            <VStack max fullHeight style={{ overflow: 'auto' }}>
                <Navbar />
                <Suspense key={stableKey} fallback={<PageLoader />}>
                    <div className="contentPageWrapper">
                        <div className="contentPage">
                            <Outlet />
                        </div>
                    </div>
                </Suspense>
            </VStack>
        </HStack>
    );
};
