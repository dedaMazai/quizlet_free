import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoginPage } from '@/pages/LoginPage';
import { RoutePath } from '@/shared/config/router/routePath';
import { AppRoutesProps } from '@/shared/types/router';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { UserPage } from '@/pages/UserPage';
import { Accesses } from '@/shared/types/accesses';
import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { AccountPage, AccountTab } from '@/pages/AccountPage';
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
import { DevUiPage } from '@/pages/DevUiPage';

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
        element: <AccountPage tab={AccountTab.PROFILE} />,
        withSidebar: true,
        authOnly: true,
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
    },
    {
        path: RoutePath.SETTINGS(),
        element: <AccountPage tab={AccountTab.SETTINGS} />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.DECKS(),
        element: <DecksPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.DECK(':deckId'),
        element: <DeckPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.FLASHCARDS(':deckId'),
        element: <FlashcardsPage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.LEARN(':deckId'),
        element: <LearnPage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.WRITE(':deckId'),
        element: <WritePage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.CLOZE(':deckId'),
        element: <ClozePage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.ORDER(':deckId'),
        element: <OrderPage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.DECK_FAVORITES_LEARN(':deckId'),
        element: <DeckFavoriteLearnPage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.ALL_WORDS(),
        element: <AllWordsPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.ALL_WORDS_FLASHCARDS(),
        element: <AllWordsFlashcardsPage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.ALL_WORDS_LEARN(),
        element: <AllWordsLearnPage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.REVIEW(),
        element: <ReviewPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.PROGRESS(),
        element: <ProgressPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.FAVORITES(),
        element: <FavoritesPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.FAVORITES_FLASHCARDS(),
        element: <FavoriteFlashcardsPage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.FAVORITES_LEARN(),
        element: <FavoriteLearnPage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.CYCLES(),
        element: <CyclesPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.CYCLE(':cycleId'),
        element: <CyclePage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.CYCLE_STUDY(':cycleId', ':mode'),
        element: <CycleStudyPage />,
        authOnly: true,
        focusLayout: true,
    },
    {
        path: RoutePath.GRAMMAR_TENSES(),
        element: <GrammarTensesPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.GRAMMAR_TENSE_GROUP(':group'),
        element: <TenseGroupPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.GRAMMAR_PRACTICE(),
        element: <GrammarPracticePage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.IRREGULAR_VERBS(),
        element: <IrregularVerbsPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.GRAMMAR_TOPIC(':topic'),
        element: <GrammarTopicPage />,
        authOnly: true,
        withSidebar: true,
    },
    {
        path: RoutePath.ROADMAP(),
        element: <RoadmapPage />,
        authOnly: true,
        withSidebar: true,
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
    // Проверочная страница примитивов shared/ui — только в dev-сборке
    ...(__IS_DEV__ ? [{
        path: RoutePath.DEV_UI(),
        element: <DevUiPage />,
        authOnly: true,
        withSidebar: true,
    }] : []),
    {
        path: '*',
        element: <NotFoundPage />,
        authOnly: true,
    },
];
