import { useGetAiUsageQuery } from '../api/cardApi';

/** С этого остатка — плашка «срочно» рядом с ИИ-кнопками (BACKLOG §3) */
const LOW_QUOTA = 3;

interface AiQuota {
  /** Осталось ИИ-запросов на сегодня; undefined — ещё не загружено */
  remaining?: number;
  /** 1–3: предупреждаем плашкой */
  isLow: boolean;
  /** 0: ИИ-кнопки disabled с тултипом */
  isExhausted: boolean;
}

/** Остаток дневного лимита ИИ (у админа 9999 — никогда не low) */
export const useAiQuota = (options?: { skip?: boolean }): AiQuota => {
  const { data: remaining } = useGetAiUsageQuery(undefined, { skip: options?.skip });

  return {
    remaining,
    isLow: remaining !== undefined && remaining > 0 && remaining <= LOW_QUOTA,
    isExhausted: remaining !== undefined && remaining <= 0,
  };
};
