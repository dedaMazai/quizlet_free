import { Card } from '@/entities/Card';
import { shuffle } from '@/shared/lib/utils';

export type WriteDirection = 'ru-en' | 'en-ru';

export interface WriteSettings {
  direction: WriteDirection;
  /** Засчитывать ответ с одной опечаткой как «почти верно». */
  typoTolerance: boolean;
}

export type AnswerGrade = 'correct' | 'almost' | 'wrong';

/** Минимальная длина эталона, при которой допускается опечатка. */
export const MIN_TYPO_LENGTH = 4;

/** Нормализация ответа для сравнения (как в learnEngine). */
const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

/** Что показываем пользователю в вопросе. */
export const promptFor = (card: Card, direction: WriteDirection): string =>
  (direction === 'ru-en' ? card.translation : card.term);

/** Что должен написать пользователь. */
export const expectedFor = (card: Card, direction: WriteDirection): string =>
  (direction === 'ru-en' ? card.term : card.translation);

/**
 * Расстояние Дамерау-Левенштейна (OSA-вариант): вставка, удаление, замена
 * и перестановка соседних символов считаются за одну операцию.
 */
export const damerauLevenshtein = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => {
    const row = new Array<number>(n + 1).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= n; j += 1) d[0][j] = j;

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // удаление
        d[i][j - 1] + 1, // вставка
        d[i - 1][j - 1] + cost, // замена
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // перестановка соседних
      }
    }
  }
  return d[m][n];
};

/**
 * Оценивает ответ: точное совпадение после нормализации — «верно»;
 * при включённой толерантности одна опечатка в слове от MIN_TYPO_LENGTH
 * символов — «почти верно»; иначе — «неверно».
 */
export const checkAnswer = (expected: string, input: string, typoTolerance: boolean): AnswerGrade => {
  const exp = normalize(expected);
  const inp = normalize(input);
  if (inp === exp) return 'correct';
  if (typoTolerance && exp.length >= MIN_TYPO_LENGTH && damerauLevenshtein(inp, exp) <= 1) {
    return 'almost';
  }
  return 'wrong';
};

/** Метка режима для журнала статистики. */
export const statsMode = (direction: WriteDirection): 'write_ru_en' | 'write_en_ru' =>
  (direction === 'ru-en' ? 'write_ru_en' : 'write_en_ru');

/** Очередь uuid'ов всех карточек в перемешанном порядке. */
export const buildQueue = (cards: Card[]): string[] =>
  shuffle(cards).map((c) => c.uuid);
