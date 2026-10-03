/**
 * Оценка текстового ответа пользователя с допуском на опечатку.
 * Чистая строковая арифметика: ничего не знает о доменной модели,
 * поэтому переиспользуется всеми режимами с вводом (письмо, пропуски).
 */

export type AnswerGrade = 'correct' | 'almost' | 'wrong';

/** Минимальная длина эталона, при которой допускается опечатка. */
export const MIN_TYPO_LENGTH = 4;

/** Нормализация ответа для сравнения. */
export const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');

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

/** «ё» и «е» на письме взаимозаменяемы — не считаем это ошибкой. */
const unifyYo = (value: string): string => value.replace(/ё/g, 'е').replace(/Ё/g, 'Е');

/**
 * Как checkAnswer, но эталон может перечислять варианты через «,» или «;»
 * («собака, пёс»): засчитывается вся строка целиком или любой из вариантов.
 */
export const checkAnswerVariants = (expected: string, input: string, typoTolerance: boolean): AnswerGrade => {
  const unifiedExpected = unifyYo(expected);
  const variants = [unifiedExpected, ...unifiedExpected.split(/[,;]/)].filter((v) => v.trim());
  const grades = variants.map((variant) => checkAnswer(variant, unifyYo(input), typoTolerance));
  if (grades.includes('correct')) return 'correct';
  if (grades.includes('almost')) return 'almost';
  return 'wrong';
};
