/** Один ответ в сессии заучивания — драфт, который буферизуется до батч-вставки. */
export interface StudyEventDraft {
  card_id: string;
  is_correct: boolean;
  level_before: number;
  level_after: number;
  mode: 'choice' | 'write' | 'write_ru_en' | 'write_en_ru' | 'cloze' | 'order';
  duration_ms: number;
  /** Один запуск режима; новый и при «Заново» */
  session_id: string;
}

/** Аргумент мутации логирования: ключ/имя колоды + накопленные события. */
export interface LogStudyEventsDto {
  deckKey: string;
  deckName: string;
  events: StudyEventDraft[];
}

/** Сводка: точность, время, серии. */
export interface StudyOverview {
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number | null;
  totalDurationMs: number;
  currentStreak: number;
  longestStreak: number;
}

/** Один активный день для тепловой карты. */
export interface HeatmapDay {
  date: string;
  count: number;
}

/** Точность по колоде (с именем-снапшотом). */
export interface DeckAccuracy {
  deckKey: string;
  deckName: string | null;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
}

/** Распределение карточек по стадиям освоения. */
export interface MasteryBucket {
  new: number;
  learning: number;
  mastered: number;
}

export interface DeckMastery extends MasteryBucket {
  deckKey: string;
}

export interface MasteryStats {
  overall: MasteryBucket;
  perDeck: DeckMastery[];
}

/** Сколько карточек придёт к повторению в день прогноза (день 0 включает просроченные). */
export interface ForecastDay {
  date: string;
  count: number;
}

/** Долг и новые слова колоды. */
export interface DeckDue {
  deckUuid: string;
  /** Просрочено сейчас — как get_due_count. */
  due: number;
  /** Карточки без строки в card_reviews. */
  new: number;
}

export interface DueSummaryArgs {
  /** Часовой пояс пользователя — границы дней прогноза */
  tz: string;
  /** Дней прогноза; по умолчанию 7 (как в RPC) */
  days?: number;
}

export interface DueSummary {
  forecast: ForecastDay[];
  perDeck: DeckDue[];
}

/** Колода с примерами и дата последней сессии «Пропуски». */
export interface DeckClozeStats {
  deckUuid: string;
  examplesCount: number;
  lastClozeAt: string | null;
}

/** Период KPI-полосы на странице прогресса */
export enum StatsPeriod {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

/** Показатели за один период */
export interface PeriodStats {
  totalAnswers: number;
  correctAnswers: number;
  totalDurationMs: number;
  /** Ответы без перерыва дольше 30 минут */
  sessions: number;
}

export interface ProgressSummaryArgs {
  tz: string;
  period: StatsPeriod;
}

/** Текущий период и такой же период до него — для дельт ▲ */
export interface ProgressSummary {
  current: PeriodStats;
  previous: PeriodStats;
}
