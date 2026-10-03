import { CycleWord, CycleWordStatus, LearningCycle } from '../types/cycle';

/**
 * Расписание цикла заучивания. Слово открывается в одной из порций (word.portion)
 * и остаётся открытым при любых перестановках; текущая порция — «сегодняшние» слова.
 * Порции открывает RPC sync_cycle_portion, здесь — только чистые выборки.
 * Все функции ожидают слова, отсортированные по position.
 */

type ScheduleCycle = Pick<LearningCycle,
  'daily_new_count' | 'current_portion' | 'portion_date' | 'start_word_uuid'>;

const isToday = (cycle: ScheduleCycle, word: CycleWord): boolean =>
  cycle.current_portion > 0 && word.portion === cycle.current_portion;

/**
 * Нужно ли открыть порцию: наступил новый день, либо сегодняшняя порция
 * неполная, а в очереди есть слова (их дописали после открытия порции).
 */
export const needsPortionSync = (cycle: ScheduleCycle, words: CycleWord[], today: string): boolean => {
  if (cycle.portion_date !== today) return true;
  const hasLocked = words.some((w) => w.portion === null);
  const todayCount = words.filter((w) => isToday(cycle, w)).length;
  return hasLocked && todayCount < cycle.daily_new_count;
};

/** Индекс точки старта повтора в списке; 0, если она не задана или слово удалено. */
export const getStartIndex = (cycle: ScheduleCycle, words: CycleWord[]): number => {
  if (!cycle.start_word_uuid) return 0;
  return Math.max(0, words.findIndex((w) => w.uuid === cycle.start_word_uuid));
};

/** Сегодняшние новые слова. */
export const buildNewWords = (cycle: ScheduleCycle, words: CycleWord[]): CycleWord[] =>
  words.filter((w) => isToday(cycle, w));

/**
 * Слова для повтора: открытые слова от точки старта, а до неё — только важные
 * и сегодняшние (сегодняшние повторяются всегда). Порядок — порядок списка.
 */
export const buildReviewWords = (cycle: ScheduleCycle, words: CycleWord[]): CycleWord[] => {
  const startIdx = getStartIndex(cycle, words);
  return words.filter((w, i) => w.portion !== null && (i >= startIdx || w.is_important || isToday(cycle, w)));
};

/** Статус слова по его индексу в списке. */
export const getWordStatus = (
  cycle: ScheduleCycle,
  word: CycleWord,
  index: number,
  startIdx: number,
): CycleWordStatus => {
  if (word.portion === null) return 'locked';
  if (isToday(cycle, word)) return 'today';
  if (index < startIdx && !word.is_important) return 'skipped';
  return 'unlocked';
};
