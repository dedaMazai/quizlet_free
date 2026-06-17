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
import { DecksPage } from '@/pages/DecksPage';
import { DeckPage } from '@/pages/DeckPage';
import { AllWordsPage } from '@/pages/AllWordsPage';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { LearnPage } from '@/pages/LearnPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { FavoriteFlashcardsPage } from '@/pages/FavoriteFlashcardsPage';
import { FavoriteLearnPage } from '@/pages/FavoriteLearnPage';

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
        path: RoutePath.DECKS(),
        element: <DecksPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.DECKS(),
                    label: i18n.t('Колоды'),
                },
            ]),
        },
    },
    {
        path: RoutePath.DECK(':deckId'),
        element: <DeckPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: (params: Record<string, string | undefined>) => ([
                {
                    path: () => RoutePath.DECKS(),
                    label: i18n.t('Колоды'),
                },
                {
                    path: () => RoutePath.DECK(`${params.deckId}`),
                    label: i18n.t('Колода'),
                    type: 'deck',
                },
            ]),
        },
    },
    {
        path: RoutePath.FLASHCARDS(':deckId'),
        element: <FlashcardsPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: (params: Record<string, string | undefined>) => ([
                {
                    path: () => RoutePath.DECKS(),
                    label: i18n.t('Колоды'),
                },
                {
                    path: () => RoutePath.DECK(`${params.deckId}`),
                    label: i18n.t('Колода'),
                    type: 'deck',
                },
                {
                    path: () => RoutePath.FLASHCARDS(`${params.deckId}`),
                    label: i18n.t('Карточки'),
                },
            ]),
        },
    },
    {
        path: RoutePath.LEARN(':deckId'),
        element: <LearnPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: (params: Record<string, string | undefined>) => ([
                {
                    path: () => RoutePath.DECKS(),
                    label: i18n.t('Колоды'),
                },
                {
                    path: () => RoutePath.DECK(`${params.deckId}`),
                    label: i18n.t('Колода'),
                    type: 'deck',
                },
                {
                    path: () => RoutePath.LEARN(`${params.deckId}`),
                    label: i18n.t('Заучивание'),
                },
            ]),
        },
    },
    {
        path: RoutePath.ALL_WORDS(),
        element: <AllWordsPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.ALL_WORDS(),
                    label: i18n.t('Все слова'),
                },
            ]),
        },
    },
    {
        path: RoutePath.FAVORITES(),
        element: <FavoritesPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.FAVORITES(),
                    label: i18n.t('Избранное'),
                },
            ]),
        },
    },
    {
        path: RoutePath.FAVORITES_FLASHCARDS(),
        element: <FavoriteFlashcardsPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.FAVORITES(),
                    label: i18n.t('Избранное'),
                },
                {
                    path: () => RoutePath.FAVORITES_FLASHCARDS(),
                    label: i18n.t('Карточки'),
                },
            ]),
        },
    },
    {
        path: RoutePath.FAVORITES_LEARN(),
        element: <FavoriteLearnPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.FAVORITES(),
                    label: i18n.t('Избранное'),
                },
                {
                    path: () => RoutePath.FAVORITES_LEARN(),
                    label: i18n.t('Заучивание'),
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
