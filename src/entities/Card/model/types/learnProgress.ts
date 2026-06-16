export type CardLevel = 0 | 1 | 2; // 0=не начато/сброшено, 1=пройдено выбором, 2=усвоено (написание)

export interface LearnProgress {
  deck_uuid: string;
  levels: Record<string, CardLevel>; // cardUuid -> level
  updated_at: string;
}
