import { useCallback, useState } from 'react';
import { translateWord } from '@/shared/lib/translate';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';

interface UseAutoTranslateResult {
  /** Идентификаторы строк, для которых сейчас выполняется перевод. */
  translatingIds: Set<string>;
  /**
   * Запросить перевод термина для строки (с дебаунсом). Результат отдаётся в
   * `onResult` только если перевод непустой — вызывающий сам решает, подставлять
   * ли его (например, лишь когда поле перевода пустое).
   */
  requestTranslation: (id: string, term: string) => void;
}

/**
 * Дебаунс-обёртка над `translateWord` для построчного редактора: переводит
 * термин через ~500мс после ввода и отдаёт результат для конкретной строки.
 */
export const useAutoTranslate = (
  onResult: (id: string, translation: string) => void,
): UseAutoTranslateResult => {
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());

  const setTranslating = useCallback((id: string, active: boolean) => {
    setTranslatingIds((prev) => {
      const next = new Set(prev);
      if (active) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const translate = useCallback(
    async (id: string, term: string) => {
      const query = term.trim();
      if (!query) {
        return;
      }
      setTranslating(id, true);
      const result = await translateWord(query);
      setTranslating(id, false);
      if (result) {
        onResult(id, result);
      }
    },
    [onResult, setTranslating],
  );

  const requestTranslation = useDebounce(translate, 500);

  return { translatingIds, requestTranslation };
};
