import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { PageLoader } from '@/widgets/PageLoader';
import { PublicHeader } from '@/widgets/PublicHeader';
import { PublicFooter } from '@/widgets/PublicFooter';

export const PublicLayout = () => (
    <div className="publicScroll">
        <PublicHeader />
        <main className="publicPage">
            <Suspense fallback={<PageLoader />}>
                <Outlet />
            </Suspense>
        </main>
        <PublicFooter />
    </div>
);
