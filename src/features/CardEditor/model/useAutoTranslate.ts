import { useCallback, useState } from 'react';
import { translateWord, TranslationResult } from '@/shared/lib/translate';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';

interface UseAutoTranslateResult {
  /** Идентификаторы строк, для которых сейчас выполняется перевод. */
  translatingIds: Set<string>;
  /**
   * Запросить перевод термина для строки (с дебаунсом). Результат отдаётся в
   * `onResult` только если перевод непустой; вместе с результатом передаётся
   * исходный термин — вызывающий может отбросить устаревший ответ.
   */
  requestTranslation: (id: string, term: string) => void;
}

/**
 * Дебаунс-обёртка над `translateWord` для построчного редактора: переводит
 * термин через ~500мс после ввода и отдаёт результат для конкретной строки.
 */
export const useAutoTranslate = (
  onResult: (id: string, result: TranslationResult, term: string) => void,
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
        onResult(id, result, query);
      }
      // null — ошибка/лимит/пусто: оставляем поле пустым для ручного ввода.
    },
    [onResult, setTranslating],
  );

  const requestTranslation = useDebounce(translate, 500);

  return { translatingIds, requestTranslation };
};
