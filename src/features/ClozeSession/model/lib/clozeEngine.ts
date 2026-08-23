import { Card } from '@/entities/Card';
import { AnswerGrade, checkAnswer } from '@/shared/lib/text';
import { shuffle } from '@/shared/lib/utils';

/** Символы, которые считаются частью слова при поиске границ. */
const WORD_CHARS = "A-Za-z0-9'’-";

/** Экранирует term для безопасной подстановки в регулярное выражение. */
const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Ищет вхождение по границам слова. Lookbehind не используем сознательно:
 * Safari до 16.3 его не поддерживает, а он есть в browserslist проекта.
 * Ведущий разделитель захватывается группой 1, само слово — группой 2.
 */
const matchWithBoundaries = (example: string, pattern: string): RegExpMatchArray | null =>
  example.match(new RegExp(`(^|[^${WORD_CHARS}])(${pattern})(?![${WORD_CHARS}])`, 'i'));

/**
 * Ищет term в примере. Каскад: точное вхождение, затем — для одиночного
 * английского слова — регулярные словоформы. Нерегулярные формы (go/went)
 * сознательно не покрываем: это словарь на сотни строк ради краевого случая.
 */
const findTerm = (example: string, term: string): RegExpMatchArray | null => {
  const escaped = escapeRegExp(term.trim());
  const exact = matchWithBoundaries(example, escaped);
  if (exact) return exact;

  const isSingleWord = !/\s/.test(term.trim());
  if (!isSingleWord) return null;

  const stem = escaped.replace(/y$/i, '');
  return matchWithBoundaries(example, `${escaped}(?:s|es|ed|d|ing)?`)
    ?? matchWithBoundaries(example, `${stem}(?:ies|ied)`);
};

/**
 * Убирает хвостовой перевод в скобках: примеры в приложении хранятся как
 * «English sentence. (Русский перевод.)», и такой перевод прямо подсказывал бы
 * ответ. В фидбэке пример показывается целиком.
 */
const stripTranslation = (example: string): string => {
  const stripped = example.replace(/\s*\([^()]*[\u0400-\u04FF][^()]*\)\s*$/, '').trim();
  return stripped || example;
};

export interface ClozeItem {
  card: Card;
  /** Часть примера до пропуска. */
  before: string;
  /** Часть примера после пропуска. */
  after: string;
  /** Принимаемые ответы: сам term и найденная в примере словоформа. */
  expected: string[];
}

/** Готовит карточку к режиму пропусков; null — если term в примере не найден. */
export const buildClozeItem = (card: Card): ClozeItem | null => {
  const raw = card.example?.trim();
  if (!raw) return null;

  const example = stripTranslation(raw);
  const match = findTerm(example, card.term);
  if (!match || match.index === undefined) return null;

  const separator = match[1];
  const surface = match[2];
  const start = match.index + separator.length;

  return {
    card,
    before: example.slice(0, start),
    after: example.slice(start + surface.length),
    expected: Array.from(new Set([card.term.trim(), surface])),
  };
};

/** Годные для режима карточки в случайном порядке. */
export const buildClozeItems = (cards: Card[]): ClozeItem[] =>
  shuffle(cards).map(buildClozeItem).filter((item): item is ClozeItem => item !== null);

/** Сколько карточек колоды подходят для режима. */
export const countFittingCards = (cards: Card[]): number =>
  cards.reduce((acc, card) => acc + (buildClozeItem(card) ? 1 : 0), 0);

/** Лучшая из оценок по всем допустимым вариантам ответа. */
export const gradeCloze = (
  expected: string[],
  input: string,
  typoTolerance: boolean,
): AnswerGrade => {
  const grades = expected.map((variant) => checkAnswer(variant, input, typoTolerance));
  if (grades.includes('correct')) return 'correct';
  if (grades.includes('almost')) return 'almost';
  return 'wrong';
};
