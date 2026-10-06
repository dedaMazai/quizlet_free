// Только относительные импорты: список читает и scripts/prerender.ts (ts-node без алиасов)
import { ASPECT_GROUP_ORDER } from '../../const/grammar/tenses';
import { GRAMMAR_TOPIC_ORDER } from '../../const/grammar/topics';
import { RoutePath, checkIsPublicPage } from './routePath';

/**
 * Страницы для поисковиков: пререндерятся при сборке и попадают в sitemap.xml.
 * Контент у них статичный, гость видит то же, что и краулер.
 */
export const INDEXABLE_PAGES: string[] = [
  RoutePath.ABOUT(),
  RoutePath.GRAMMAR_TENSES(),
  ...ASPECT_GROUP_ORDER.map((group) => RoutePath.GRAMMAR_TENSE_GROUP(group)),
  RoutePath.IRREGULAR_VERBS(),
  RoutePath.ROADMAP(),
  ...GRAMMAR_TOPIC_ORDER.map((topic) => RoutePath.GRAMMAR_TOPIC(topic)),
  RoutePath.TERMS(),
  RoutePath.PRIVACY(),
  RoutePath.PD_CONSENT(),
];

/** Страницы, которые гость видит без проверки сессии: публичные и открытые для поиска */
export const checkIsGuestPage = (pathname: string) => {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  return checkIsPublicPage(normalizedPath) || INDEXABLE_PAGES.includes(normalizedPath);
};
