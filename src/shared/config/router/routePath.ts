import { RouteNames } from './routerNames';

export const RoutePath = {
  [RouteNames.MAIN]: () => '/',
  [RouteNames.PROFILE]: () => '/profile',
  [RouteNames.CHANGE_PASSWORD]: () => '/change_password',
  [RouteNames.LOGIN]: () => '/login',
  [RouteNames.SETTINGS]: (value?: string) => `/settings${value || ''}`,
  [RouteNames.USER]: (id: string | number) => `/users/${id}`,
  [RouteNames.PRIVACY]: () => '/privacy',
  [RouteNames.FORBIDDEN]: () => '/forbidden',
  [RouteNames.DECKS]: () => '/decks',
  [RouteNames.DECK]: (id: string) => `/decks/${id}`,
  [RouteNames.ALL_WORDS]: () => '/words',
  [RouteNames.ALL_WORDS_FLASHCARDS]: () => '/words/flashcards',
  [RouteNames.ALL_WORDS_LEARN]: () => '/words/learn',
  [RouteNames.FLASHCARDS]: (id: string) => `/decks/${id}/flashcards`,
  [RouteNames.LEARN]: (id: string) => `/decks/${id}/learn`,
  [RouteNames.WRITE]: (id: string) => `/decks/${id}/write`,
  [RouteNames.CLOZE]: (id: string) => `/decks/${id}/cloze`,
  [RouteNames.ORDER]: (id: string) => `/decks/${id}/order`,
  [RouteNames.DECK_FAVORITES_LEARN]: (id: string) => `/decks/${id}/learn-favorites`,
  [RouteNames.FAVORITES]: () => '/favorites',
  [RouteNames.FAVORITES_FLASHCARDS]: () => '/favorites/flashcards',
  [RouteNames.FAVORITES_LEARN]: () => '/favorites/learn',
  [RouteNames.PROGRESS]: () => '/progress',
  [RouteNames.REVIEW]: () => '/review',
  [RouteNames.ABOUT]: () => '/about',
  [RouteNames.FEATURES]: () => '/features',
  [RouteNames.FAQ]: () => '/faq',
  [RouteNames.GRAMMAR_TENSES]: () => '/grammar/tenses',
  [RouteNames.GRAMMAR_TENSE_GROUP]: (group: string) => `/grammar/tenses/${group}`,
  [RouteNames.GRAMMAR_PRACTICE]: () => '/grammar/practice',
  [RouteNames.GRAMMAR_TOPIC]: (topic: string) => `/grammar/topics/${topic}`,
  [RouteNames.IRREGULAR_VERBS]: () => '/grammar/irregular-verbs',
  [RouteNames.ROADMAP]: () => '/roadmap',
  // last
  [RouteNames.NOT_FOUND]: () => '/*',
};

export const PUBLIC_PAGES = [
  RoutePath.LOGIN(),
  RoutePath.CHANGE_PASSWORD(),
  RoutePath.PRIVACY(),
  RoutePath.ABOUT(),
  RoutePath.FEATURES(),
  RoutePath.FAQ(),
] as const;


export const checkIsPublicPage = (pathname: string) => {
  // Нормализуем текущий путь: убираем завершающие слеши и query параметры
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  return PUBLIC_PAGES.some(publicPath => {
      const normalizedPublicPath = publicPath.replace(/\/+$/, '') || '/';
      return normalizedPath === normalizedPublicPath;
  });
};
