const STORAGE_KEY = 'quizlet_free:favorites';

// Избранное хранится как массив uuid карточек.
const read = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? [] : (JSON.parse(raw) as string[]);
  } catch {
    return [];
  }
};

const write = (uuids: string[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(uuids));
};

export const favoritesRepo = {
  getAll: (): string[] => read(),
  has: (uuid: string): boolean => read().includes(uuid),
  toggle: (uuid: string): string[] => {
    const current = read();
    const next = current.includes(uuid)
      ? current.filter((id) => id !== uuid)
      : [...current, uuid];
    write(next);
    return next;
  },
};
