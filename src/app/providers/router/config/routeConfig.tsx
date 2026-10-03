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
import { ProgressPage } from '@/pages/ProgressPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { MainPage } from '@/pages/MainPage';
import { DecksPage } from '@/pages/DecksPage';
import { DeckPage } from '@/pages/DeckPage';
import { AllWordsPage } from '@/pages/AllWordsPage';
import { AllWordsFlashcardsPage } from '@/pages/AllWordsFlashcardsPage';
import { AllWordsLearnPage } from '@/pages/AllWordsLearnPage';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { LearnPage } from '@/pages/LearnPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { FavoriteFlashcardsPage } from '@/pages/FavoriteFlashcardsPage';
import { FavoriteLearnPage } from '@/pages/FavoriteLearnPage';
import { DeckFavoriteLearnPage } from '@/pages/DeckFavoriteLearnPage';
import { WritePage } from '@/pages/WritePage';
import { ClozePage } from '@/pages/ClozePage';
import { OrderPage } from '@/pages/OrderPage';
import { AboutPage } from '@/pages/AboutPage';
import { FeaturesPage } from '@/pages/FeaturesPage';
import { FaqPage } from '@/pages/FaqPage';
import { GrammarTensesPage } from '@/pages/GrammarTensesPage';
import { TenseGroupPage } from '@/pages/TenseGroupPage';
import { IrregularVerbsPage } from '@/pages/IrregularVerbsPage';
import { GrammarPracticePage } from '@/pages/GrammarPracticePage';
import { GrammarTopicPage } from '@/pages/GrammarTopicPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { CyclesPage } from '@/pages/CyclesPage';
import { CyclePage } from '@/pages/CyclePage';
import { CycleStudyPage } from '@/pages/CycleStudyPage';

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
        path: RoutePath.WRITE(':deckId'),
        element: <WritePage />,
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
                    path: () => RoutePath.WRITE(`${params.deckId}`),
                    label: i18n.t('Письмо'),
                },
            ]),
        },
    },
    {
        path: RoutePath.CLOZE(':deckId'),
        element: <ClozePage />,
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
                    path: () => RoutePath.CLOZE(`${params.deckId}`),
                    label: i18n.t('Пропуски'),
                },
            ]),
        },
    },
    {
        path: RoutePath.ORDER(':deckId'),
        element: <OrderPage />,
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
                    path: () => RoutePath.ORDER(`${params.deckId}`),
                    label: i18n.t('Собери фразу'),
                },
            ]),
        },
    },
    {
        path: RoutePath.DECK_FAVORITES_LEARN(':deckId'),
        element: <DeckFavoriteLearnPage />,
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
                    path: () => RoutePath.DECK_FAVORITES_LEARN(`${params.deckId}`),
                    label: i18n.t('Заучивание избранного'),
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
        path: RoutePath.ALL_WORDS_FLASHCARDS(),
        element: <AllWordsFlashcardsPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.ALL_WORDS(),
                    label: i18n.t('Все слова'),
                },
                {
                    path: () => RoutePath.ALL_WORDS_FLASHCARDS(),
                    label: i18n.t('Карточки'),
                },
            ]),
        },
    },
    {
        path: RoutePath.ALL_WORDS_LEARN(),
        element: <AllWordsLearnPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.ALL_WORDS(),
                    label: i18n.t('Все слова'),
                },
                {
                    path: () => RoutePath.ALL_WORDS_LEARN(),
                    label: i18n.t('Заучивание'),
                },
            ]),
        },
    },
    {
        path: RoutePath.REVIEW(),
        element: <ReviewPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.REVIEW(),
                    label: i18n.t('К повторению'),
                },
            ]),
        },
    },
    {
        path: RoutePath.PROGRESS(),
        element: <ProgressPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.PROGRESS(),
                    label: i18n.t('Прогресс'),
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
        path: RoutePath.CYCLES(),
        element: <CyclesPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.CYCLES(),
                    label: i18n.t('Циклы заучивания'),
                },
            ]),
        },
    },
    {
        path: RoutePath.CYCLE(':cycleId'),
        element: <CyclePage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: (params: Record<string, string | undefined>) => ([
                {
                    path: () => RoutePath.CYCLES(),
                    label: i18n.t('Циклы заучивания'),
                },
                {
                    path: () => RoutePath.CYCLE(`${params.cycleId}`),
                    label: i18n.t('Цикл'),
                    type: 'cycle',
                },
            ]),
        },
    },
    {
        path: RoutePath.CYCLE_STUDY(':cycleId', ':mode'),
        element: <CycleStudyPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: (params: Record<string, string | undefined>) => ([
                {
                    path: () => RoutePath.CYCLES(),
                    label: i18n.t('Циклы заучивания'),
                },
                {
                    path: () => RoutePath.CYCLE(`${params.cycleId}`),
                    label: i18n.t('Цикл'),
                    type: 'cycle',
                },
                {
                    path: () => RoutePath.CYCLE_STUDY(`${params.cycleId}`, `${params.mode}`),
                    label: i18n.t('Заучивание'),
                },
            ]),
        },
    },
    {
        path: RoutePath.GRAMMAR_TENSES(),
        element: <GrammarTensesPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.GRAMMAR_TENSES(),
                    label: i18n.t('Времена английского'),
                },
            ]),
        },
    },
    {
        path: RoutePath.GRAMMAR_TENSE_GROUP(':group'),
        element: <TenseGroupPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: (params: Record<string, string | undefined>) => ([
                {
                    path: () => RoutePath.GRAMMAR_TENSES(),
                    label: i18n.t('Времена английского'),
                },
                {
                    path: () => RoutePath.GRAMMAR_TENSE_GROUP(`${params.group}`),
                    label: i18n.t('Группа времён'),
                },
            ]),
        },
    },
    {
        path: RoutePath.GRAMMAR_PRACTICE(),
        element: <GrammarPracticePage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.GRAMMAR_TENSES(),
                    label: i18n.t('Времена английского'),
                },
                {
                    path: () => RoutePath.GRAMMAR_PRACTICE(),
                    label: i18n.t('Практика времён'),
                },
            ]),
        },
    },
    {
        path: RoutePath.IRREGULAR_VERBS(),
        element: <IrregularVerbsPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.IRREGULAR_VERBS(),
                    label: i18n.t('Неправильные глаголы'),
                },
            ]),
        },
    },
    {
        path: RoutePath.GRAMMAR_TOPIC(':topic'),
        element: <GrammarTopicPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: (params: Record<string, string | undefined>) => ([
                {
                    path: () => RoutePath.ROADMAP(),
                    label: i18n.t('Дорожная карта'),
                },
                {
                    path: () => RoutePath.GRAMMAR_TOPIC(`${params.topic}`),
                    label: i18n.t('Тема грамматики'),
                },
            ]),
        },
    },
    {
        path: RoutePath.ROADMAP(),
        element: <RoadmapPage />,
        authOnly: true,
        withSidebar: true,
        handle: {
            crumbs: () => ([
                {
                    path: () => RoutePath.ROADMAP(),
                    label: i18n.t('Дорожная карта'),
                },
            ]),
        },
    },
    {
        path: RoutePath.PRIVACY(),
        element: <PrivacyPage />,
    },
    {
        path: RoutePath.ABOUT(),
        element: <AboutPage />,
        publicLayout: true,
    },
    {
        path: RoutePath.FEATURES(),
        element: <FeaturesPage />,
        publicLayout: true,
    },
    {
        path: RoutePath.FAQ(),
        element: <FaqPage />,
        publicLayout: true,
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
