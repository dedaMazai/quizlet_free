import { Card } from './card';

/** Уровень освоенности карточки: производное от состояния повторения (см. srs.ts). */
export type CardLevel = 0 | 1 | 2; // 0 = новая/заваленная, 1 = изучается, 2 = усвоена

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

/**
 * Статус слова в библиотеке: как в get_mastery (level 2 / 1 / остальное),
 * «due» — пора повторять (due_at ≤ сейчас).
 */
export type CardStatus = 'new' | 'learning' | 'mastered' | 'due';

/** Фильтр выборки «Все слова» / «Избранное»; без page/pageSize — все строки. */
export interface LibraryCardsArgs {
  search?: string;
  deckUuid?: string;
  status?: CardStatus;
  type?: Card['card_type'];
  /** Ограничить выборку конкретными карточками (избранное). */
  uuids?: string[];
  page?: number;
  pageSize?: number;
}

/** Страница библиотеки: карточки с состоянием повторения (get_library_cards). */
export interface LibraryCardsPage {
  items: DueCard[];
  /** Строк с учётом фильтров (для пагинации). */
  total: number;
  /** Разных колод в выборке. */
  deckCount: number;
}
