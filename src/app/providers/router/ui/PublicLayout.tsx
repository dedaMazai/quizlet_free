import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageLoader } from '@/widgets/PageLoader';
import { PublicHeader } from '@/widgets/PublicHeader';
import { PublicFooter } from '@/widgets/PublicFooter';
import { RoutePath } from '@/shared/config/router/routePath';

/** Название продукта не переводится. */
const BASE_TITLE = 'Flashcards';

export const PublicLayout = () => {
    const { pathname } = useLocation();
    const { t } = useTranslation();

    // Публичные страницы шарят ссылками и сохраняют в закладки — вкладка должна называться осмысленно.
    useEffect(() => {
        const titles: Record<string, string> = {
            [RoutePath.ABOUT()]: t('О сервисе'),
            [RoutePath.FEATURES()]: t('Возможности'),
            [RoutePath.FAQ()]: t('Вопросы и ответы'),
        };
        const pageTitle = titles[pathname];

        document.title = pageTitle ? `${pageTitle} — ${BASE_TITLE}` : BASE_TITLE;

        return () => {
            document.title = BASE_TITLE;
        };
    }, [pathname, t]);

    return (
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
};
