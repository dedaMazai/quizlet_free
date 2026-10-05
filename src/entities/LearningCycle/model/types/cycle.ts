export interface LearningCycle {
  uuid: string;
  name: string;
  /** Сколько новых слов открывается за день. */
  daily_new_count: number;
  /** Номер текущей (сегодняшней) порции; 0 — ни одной ещё не открыто. */
  current_portion: number;
  /** День открытия текущей порции, YYYY-MM-DD. */
  portion_date: string | null;
  /** Слово, с которого начинается повтор; null — с начала. */
  start_word_uuid: string | null;
  words_count: number;
  created_at: string;
  updated_at: string;
}

export interface CycleWord {
  uuid: string;
  cycle_uuid: string;
  term: string;
  translation: string;
  position: number;
  /** Номер порции, в которой слово открыто; null — ещё в очереди. */
  portion: number | null;
  is_important: boolean;
  created_at: string;
}

/** Слово цикла без текста — для раскладки по порциям. */
export type CycleWordPortion = Pick<CycleWord, 'uuid' | 'portion'>;

export interface CycleCreateDto {
  name: string;
  daily_new_count: number;
}

export interface CycleUpdateDto {
  uuid: string;
  name?: string;
  daily_new_count?: number;
  start_word_uuid?: string | null;
}

export interface CycleWordDraft {
  term: string;
  translation: string;
}

export interface CycleWordsAddDto {
  cycleUuid: string;
  words: CycleWordDraft[];
}

export interface CycleWordUpdateDto {
  uuid: string;
  cycleUuid: string;
  term?: string;
  translation?: string;
  is_important?: boolean;
}

export interface CycleWordsReorderDto {
  cycleUuid: string;
  /** Uuid'ы слов в новом порядке. */
  wordUuids: string[];
}

export interface CyclePortionSyncDto {
  cycleUuid: string;
  /** Локальная дата пользователя, YYYY-MM-DD. */
  today: string;
  /** Открыть новую порцию, даже если сегодня она уже открыта («Новый день»). */
  forceNew?: boolean;
}

/** Статус слова в списке цикла. */
export type CycleWordStatus = 'today' | 'unlocked' | 'skipped' | 'locked';

/** Режим сессии: только сегодняшние новые или повтор всего цикла. */
export type CycleStudyMode = 'new' | 'review';

/** Раскладка цикла на сегодня: день (номер порции) и слова по статусам. */
export interface CycleDayPlan {
  day: number;
  /** Открытые в прошлые дни слова. */
  review: number;
  /** Сегодняшняя порция. */
  today: number;
  /** Ещё не открытые слова. */
  locked: number;
}
