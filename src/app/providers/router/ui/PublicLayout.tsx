import { Suspense, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageLoader } from '@/widgets/PageLoader';
import { PublicHeader } from '@/widgets/PublicHeader';
import { PublicFooter } from '@/widgets/PublicFooter';
import { RoutePath } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { usePageMeta } from '@/shared/lib/hooks/usePageMeta';
import cls from './PublicLayout.module.scss';

interface PublicLayoutProps {
    /** Поля страницы: у лендинга и документов они свои, у страниц кабинета — нет */
    padded?: boolean;
}

export const PublicLayout = ({ padded = false }: PublicLayoutProps) => {
    const { pathname } = useLocation();
    const { t } = useTranslation();

    // Публичные страницы шарят ссылками и сохраняют в закладки — вкладка и превью должны называться осмысленно.
    // Страницы грамматики задают свои теги сами (skip), здесь — лендинг и документы
    const pageTitle = useMemo(() => {
        const titles: Record<string, string> = {
            [RoutePath.ABOUT()]: t('О сервисе'),
            [RoutePath.TERMS()]: t('Пользовательское соглашение'),
            [RoutePath.PRIVACY()]: t('Политика обработки персональных данных'),
            [RoutePath.PD_CONSENT()]: t('Согласие на обработку персональных данных'),
        };

        return titles[pathname];
    }, [pathname, t]);

    usePageMeta({
        title: pageTitle,
        description: pathname === RoutePath.ABOUT()
            ? t('Учите английские слова по карточкам с интервальными повторениями: колоды, пять режимов тренировки, проверка переводов ИИ, грамматика и статистика. Бесплатно.')
            : undefined,
        skip: !pageTitle,
    });

    return (
        <div className="publicScroll">
            <PublicHeader />
            <main className={classNames('publicPage', [], { [cls.padded]: padded })}>
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </main>
            <PublicFooter />
        </div>
    );
};
