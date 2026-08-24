import { CardReview } from '@/entities/Card';
import { StudyEventDraft } from '@/entities/Statistics';
import { SessionSteps } from './learnEngine';

/**
 * Персистентность сессии заучивания в localStorage.
 *
 * Две независимые вещи:
 * 1. Шаги сессии (learn_steps:<deckKey>) — чтобы перезагрузка страницы не откатывала
 *    карточки, прошедшие только часть шагов обучения.
 * 2. Outbox (learn_outbox) — пачки ответов, не успевшие уйти на сервер: при выгрузке
 *    страницы сетевой запрос не гарантирован, поэтому буфер синхронно пишется сюда
 *    и доотправляется при следующем открытии режима.
 */

/** Несброшенная пачка ответов, ожидающая доотправки на сервер. */
export interface OutboxEntry {
  deckKey: string;
  deckName: string;
  events: StudyEventDraft[];
  reviews: CardReview[];
}

const stepsKey = (deckKey: string): string => `learn_steps:${deckKey}`;
const OUTBOX_KEY = 'learn_outbox';

export const readStoredSteps = (deckKey: string): SessionSteps | null => {
  try {
    const raw = localStorage.getItem(stepsKey(deckKey));
    return raw ? (JSON.parse(raw) as SessionSteps) : null;
  } catch {
    return null;
  }
};

export const writeStoredSteps = (deckKey: string, steps: SessionSteps): void => {
  try {
    localStorage.setItem(stepsKey(deckKey), JSON.stringify(steps));
  } catch {
    // localStorage недоступен (приватный режим/квота) — работаем без персистентности.
  }
};

export const clearStoredSteps = (deckKey: string): void => {
  try {
    localStorage.removeItem(stepsKey(deckKey));
  } catch {
    // localStorage недоступен — очищать нечего.
  }
};

export const pushToOutbox = (entry: OutboxEntry): void => {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    const list: OutboxEntry[] = raw ? JSON.parse(raw) : [];
    list.push(entry);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(list));
  } catch {
    // localStorage недоступен — пачка теряется, как и раньше без outbox'а.
  }
};

/** Забирает и очищает outbox: вызывающий отвечает за отправку. */
export const drainOutbox = (): OutboxEntry[] => {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    localStorage.removeItem(OUTBOX_KEY);
    return JSON.parse(raw) as OutboxEntry[];
  } catch {
    return [];
  }
};
