/**
 * Сегодняшние новые слова, пройденные в сессии «Учить новые» до конца.
 * Сервер этого не хранит, поэтому — localStorage этого устройства.
 * Ключ: cycle_learned:<cycleId>, значение — день и uuid'ы слов.
 */

interface StoredLearned {
  date: string;
  words: string[];
}

const getKey = (cycleUuid: string): string => `cycle_learned:${cycleUuid}`;

/** Uuid'ы слов, выученных в день today; за прошлые дни — пусто. */
export const getLearnedToday = (cycleUuid: string, today: string): Set<string> => {
  try {
    const raw = localStorage.getItem(getKey(cycleUuid));
    const parsed = raw ? JSON.parse(raw) as Partial<StoredLearned> : null;
    if (parsed?.date !== today || !Array.isArray(parsed.words)) return new Set();
    return new Set(parsed.words);
  } catch {
    return new Set();
  }
};

export const addLearnedToday = (cycleUuid: string, today: string, wordUuids: string[]): void => {
  try {
    const words = [...getLearnedToday(cycleUuid, today), ...wordUuids];
    const stored: StoredLearned = { date: today, words: [...new Set(words)] };
    localStorage.setItem(getKey(cycleUuid), JSON.stringify(stored));
  } catch {
    // localStorage недоступен (приватный режим/квота) — счётчик «выучено» не ведём.
  }
};
