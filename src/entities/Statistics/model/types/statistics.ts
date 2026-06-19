/** Один ответ в сессии заучивания — драфт, который буферизуется до батч-вставки. */
export interface StudyEventDraft {
  card_id: string;
  is_correct: boolean;
  level_before: number;
  level_after: number;
  mode: 'choice' | 'write';
  duration_ms: number;
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
