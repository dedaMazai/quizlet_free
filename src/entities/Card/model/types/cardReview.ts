import { Card } from './card';
import { CardLevel } from './learnProgress';

/** Состояние интервального повторения одной карточки у текущего пользователя. */
export interface CardReview {
  card_uuid: string;
  /** Производное от reps/interval_days, см. levelFromReview. */
  level: CardLevel;
  /** Успешных повторов подряд; 0 — новая либо заваленная карточка. */
  reps: number;
  /** Сколько раз карточку забыли. */
  lapses: number;
  /** Фактор лёгкости SM-2. */
  ease: number;
  /** Текущий интервал в днях; 0 — карточка ещё не выпущена из обучения. */
  interval_days: number;
  due_at: string;
  last_reviewed_at?: string;
}

/** Карточка вместе с её состоянием повторения (выдача get_due_cards). */
export interface DueCard {
  card: Card;
  /** null — карточка новая, ни разу не изучалась. */
  review: CardReview | null;
}
