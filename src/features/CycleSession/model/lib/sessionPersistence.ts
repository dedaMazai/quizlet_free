import { CycleStudyMode } from '@/entities/LearningCycle';
import { CycleSessionState, sameOrder } from './cycleEngine';

/**
 * Сохранение незаконченной сессии в localStorage, чтобы перезагрузка посреди
 * длинного повтора не начинала его заново. Ключ: cycle_session:<cycleId>:<mode>.
 */

/** Брошенная сессия старше этого срока начинается заново. */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

interface StoredSession {
  savedAt: number;
  state: CycleSessionState;
}

const MODES: CycleStudyMode[] = ['new', 'review'];

export const getCycleSessionKey = (cycleUuid: string, mode: CycleStudyMode): string =>
  `cycle_session:${cycleUuid}:${mode}`;

/** Сохранённая сессия, если она свежая и собрана из того же списка слов. */
export const readStoredSession = (key: string, order: string[]): CycleSessionState | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    const isValid = typeof parsed.savedAt === 'number'
      && Date.now() - parsed.savedAt <= SESSION_TTL_MS
      && Array.isArray(parsed.state?.order)
      && sameOrder(parsed.state.order, order);
    if (!isValid || !parsed.state) {
      // Устаревшая или чужая сессия — убираем, чтобы не копить мусор в localStorage.
      localStorage.removeItem(key);
      return null;
    }
    return parsed.state;
  } catch {
    return null;
  }
};

export const writeStoredSession = (key: string, state: CycleSessionState): void => {
  try {
    const stored: StoredSession = { savedAt: Date.now(), state };
    localStorage.setItem(key, JSON.stringify(stored));
  } catch {
    // localStorage недоступен (приватный режим/квота) — работаем без сохранения.
  }
};

export const clearStoredSession = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // localStorage недоступен — очищать нечего.
  }
};

/** Удаляет сохранённые сессии цикла (при удалении цикла). */
export const clearCycleSessions = (cycleUuid: string): void => {
  MODES.forEach((mode) => clearStoredSession(getCycleSessionKey(cycleUuid, mode)));
};
