import { LearnProgress } from '../types/learnProgress';

const STORAGE_KEY = 'quizlet_free:learn_progress';

// Прогресс заучивания хранится как map deck_uuid -> LearnProgress.
type ProgressMap = Record<string, LearnProgress>;

const read = (): ProgressMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? {} : (JSON.parse(raw) as ProgressMap);
  } catch {
    return {};
  }
};

const write = (map: ProgressMap): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

export const learnProgressRepo = {
  get: (deckUuid: string): LearnProgress | null => read()[deckUuid] ?? null,
  save: (progress: LearnProgress): LearnProgress => {
    const map = read();
    map[progress.deck_uuid] = progress;
    write(map);
    return progress;
  },
};
