import { LOCAL_STORAGE_RECENT_DECKS_KEY } from '@/shared/const/localstorage';

const MAX_RECENT_DECKS = 5;

/** Недавно открытые колоды, свежие первыми — для палитры ⌘K */
export const getRecentDeckUuids = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOCAL_STORAGE_RECENT_DECKS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((uuid): uuid is string => typeof uuid === 'string') : [];
  } catch {
    return [];
  }
};

export const pushRecentDeck = (uuid: string): void => {
  const next = [uuid, ...getRecentDeckUuids().filter((item) => item !== uuid)].slice(0, MAX_RECENT_DECKS);
  try {
    localStorage.setItem(LOCAL_STORAGE_RECENT_DECKS_KEY, JSON.stringify(next));
  } catch {
    // localStorage недоступен — палитра покажет колоды по дате изменения
  }
};
