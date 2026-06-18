/** Пара языков для перевода: домен приложения — изучение английского. */
export const LANG_PAIR = 'en|ru';

/** Минимальное качество совпадения (0..1) — ниже считаем перевод ненадёжным. */
const MATCH_THRESHOLD = 0.6;

/** Сколько вариантов отдавать максимум (лучший + альтернативы). */
const MAX_CANDIDATES = 4;

/**
 * Подстроки, которыми MyMemory возвращает служебные сообщения вместо перевода
 * (например, при исчерпании дневного лимита). Такой текст не должен попадать в
 * карточку.
 */
const WARNING_MARKERS = [
  'MYMEMORY WARNING',
  'QUERY LENGTH LIMIT',
  'INVALID LANGUAGE PAIR',
  "'AUTOMATED",
  'NO TRANSLATION FOUND',
];

interface MyMemoryMatch {
  translation?: string;
  quality?: string | number;
  match?: number;
}

interface MyMemoryResponse {
  responseData?: { translatedText?: string; match?: number };
  responseStatus?: number;
  matches?: MyMemoryMatch[];
}

/** Результат автоперевода: лучший вариант и отфильтрованные альтернативы. */
export interface TranslationResult {
  best: string;
  alternatives: string[];
}

const isWarning = (text: string): boolean => {
  const upper = text.toUpperCase();
  return WARNING_MARKERS.some((marker) => upper.includes(marker));
};

const toNumber = (value: string | number | undefined): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(num) ? (num as number) : 0;
};

/**
 * Превращает ответ MyMemory в упорядоченный список уникальных переводов:
 * отбрасывает мусор и слабые совпадения, сортирует по (match, quality),
 * дедуплицирует без учёта регистра.
 */
const buildCandidates = (data: MyMemoryResponse): string[] => {
  const scored = (data.matches ?? [])
    .map((m) => ({
      text: m.translation?.trim() ?? '',
      match: toNumber(m.match),
      quality: toNumber(m.quality),
    }))
    .filter((m) => m.text && !isWarning(m.text) && m.match >= MATCH_THRESHOLD)
    .sort((a, b) => b.match - a.match || b.quality - a.quality);

  // Подстраховка: если matches пуст/отфильтрован, берём основной перевод API.
  const fallback = data.responseData?.translatedText?.trim();
  if (fallback && !isWarning(fallback)) {
    scored.push({ text: fallback, match: toNumber(data.responseData?.match), quality: 0 });
  }

  const seen = new Set<string>();
  const result: string[] = [];
  for (const { text } of scored) {
    const key = text.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(text);
    }
  }
  return result;
};

/**
 * Переводит слово через бесплатный публичный API MyMemory (без ключа, прямо из
 * браузера). Возвращает лучший вариант и список альтернатив или `null` при
 * ошибке/пустом ответе/rate-limit — в этом случае пользователь вводит перевод
 * вручную (без исключений).
 */
export const translateWord = async (text: string): Promise<TranslationResult | null> => {
  const query = text.trim();
  if (!query) {
    return null;
  }

  try {
    // Контактный email повышает дневной лимит MyMemory и приоритет ответа.
    const emailParam = __MYMEMORY_EMAIL__ ? `&de=${encodeURIComponent(__MYMEMORY_EMAIL__)}` : '';
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=${LANG_PAIR}${emailParam}`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as MyMemoryResponse;
    if (data.responseStatus !== 200) {
      return null;
    }

    const candidates = buildCandidates(data);
    if (!candidates.length) {
      return null;
    }

    return { best: candidates[0], alternatives: candidates.slice(1, MAX_CANDIDATES) };
  } catch {
    return null;
  }
};
