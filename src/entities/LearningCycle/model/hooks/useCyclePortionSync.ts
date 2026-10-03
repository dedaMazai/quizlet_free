import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useSyncCyclePortionMutation } from '../api/cycleApi';
import { needsPortionSync } from '../lib/cycleSchedule';
import { CycleWord, LearningCycle } from '../types/cycle';

/** Локальная календарная дата в формате колонки portion_date. */
export const getToday = (): string => dayjs().format('YYYY-MM-DD');

/**
 * Открывает сегодняшнюю порцию слов при входе в цикл (новый день или долив порции).
 * Возвращает true, когда расписание актуально и по нему можно строить сессию.
 */
export const useCyclePortionSync = (cycle: LearningCycle | undefined, words: CycleWord[] | undefined): boolean => {
  const [syncPortion] = useSyncCyclePortionMutation();
  const [failed, setFailed] = useState(false);
  const today = getToday();
  const needsSync = Boolean(cycle && words && needsPortionSync(cycle, words, today));
  // Не шлём тот же запрос повторно, пока ждём перезапроса цикла и слов.
  const sentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!cycle || !words || !needsSync) return;
    const signature = `${cycle.uuid}:${today}:${cycle.current_portion}:${words.length}`;
    if (sentRef.current === signature) return;
    sentRef.current = signature;
    syncPortion({ cycleUuid: cycle.uuid, today })
      .unwrap()
      // Сеть/БД недоступны — не блокируем экран, работаем по текущим данным.
      .catch(() => setFailed(true));
  }, [cycle, words, needsSync, today, syncPortion]);

  return Boolean(cycle && words) && (!needsSync || failed);
};
