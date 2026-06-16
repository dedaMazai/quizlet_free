import { NotFoundPage } from '@/pages/NotFoundPage';
import { SettingPage } from '@/pages/SettingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RoutePath } from '@/shared/config/router/routePath';
import { AppRoutesProps } from '@/shared/types/router';
import i18n from '@/shared/config/i18n/i18n';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { UserPage } from '@/pages/UserPage';
import { Accesses } from '@/shared/types/accesses';
import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { MainPage } from '@/pages/MainPage';

export const routeConfig: AppRoutesProps[] = [
    {
        path: RoutePath.LOGIN(),
        element: <LoginPage />,
        notAuthOnly: true,
    },
    {
        path: RoutePath.MAIN(),
        element: <MainPage />,
        withSidebar: true,
        authOnly: true,
    },
    {
        path: RoutePath.PROFILE(),
        element: <ProfilePage />,
        withSidebar: true,
        authOnly: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.PROFILE(),
                    label: i18n.t('Личный кабинет'),
                },
            ]),
        },
    },
    {
        path: RoutePath.CHANGE_PASSWORD(),
        element: <ChangePasswordPage />,
    },
    {
        path: RoutePath.USER(':id_user'),
        element: <UserPage />,
        authOnly: true,
        withSidebar: true,
        accesses: [Accesses.users_can_read],
        handle: {
            crumbs: (params: Record<string, string | undefined>) => ([
                {
                    path: () => RoutePath.SETTINGS('?activeTab=Users'),
                    label: i18n.t('Сотрудники'),
                },
                {
                    path: () => RoutePath.USER(`${params.id_user}`),
                    label: i18n.t('Пользователь'),
                    type: 'user',
                },
            ]),
        },
    },
    {
        path: RoutePath.SETTINGS(),
        element: <SettingPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.SETTINGS(),
                    label: i18n.t('Настройки'),
                },
            ]),
        },
    },
    {
        path: RoutePath.PRIVACY(),
        element: <PrivacyPage />,
    },
    {
        path: RoutePath.FORBIDDEN(),
        element: <ForbiddenPage />,
        authOnly: true,
    },
    {
        path: '*',
        element: <NotFoundPage />,
        authOnly: true,
    },
];
