const PREFIX = 'quizlet_free:';

export interface LocalCollection<T extends { uuid: string }> {
  getAll(): T[];
  getById(uuid: string): T | undefined;
  insert(item: T): T;
  update(item: T): T;
  remove(uuid: string): void;
}

interface CreateLocalCollectionOptions<T> {
  /** Начальные данные, применяются один раз, если ключа ещё нет в localStorage. */
  seed?: T[];
}

/**
 * Дженерик-репозиторий поверх localStorage для сущностей с полем `uuid`.
 * Используется императивно из RTK Query `queryFn` (без сети, прототип без бэкенда).
 */
export function createLocalCollection<T extends { uuid: string }>(
  key: string,
  options?: CreateLocalCollectionOptions<T>,
): LocalCollection<T> {
  const storageKey = `${PREFIX}${key}`;

  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) {
        if (options?.seed?.length) {
          localStorage.setItem(storageKey, JSON.stringify(options.seed));
          return [...options.seed];
        }
        return [];
      }
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  };

  const write = (items: T[]): void => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  return {
    getAll: () => read(),
    getById: (uuid) => read().find((item) => item.uuid === uuid),
    insert: (item) => {
      const items = read();
      write([...items, item]);
      return item;
    },
    update: (item) => {
      const items = read();
      write(items.map((it) => (it.uuid === item.uuid ? item : it)));
      return item;
    },
    remove: (uuid) => {
      write(read().filter((item) => item.uuid !== uuid));
    },
  };
}
