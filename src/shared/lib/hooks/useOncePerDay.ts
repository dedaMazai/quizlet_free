import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { LOCAL_STORAGE_MOTION_DAY_PREFIX } from '@/shared/const/localstorage';

const today = () => dayjs().format('YYYY-MM-DD');

const readDay = (key: string): string | null => {
  try {
    return localStorage.getItem(LOCAL_STORAGE_MOTION_DAY_PREFIX + key);
  } catch {
    return null;
  }
};

/**
 * `true`, если «праздничная» анимация `key` сегодня ещё не показывалась.
 * Значение фиксируется на маунт; дата пишется в эффекте, чтобы двойной рендер StrictMode её не съел.
 */
export const useOncePerDay = (key: string): boolean => {
  const [shouldPlay] = useState(() => readDay(key) !== today());

  useEffect(() => {
    if (!shouldPlay) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_MOTION_DAY_PREFIX + key, today());
    } catch {
      // Хранилище недоступно — анимация просто повторится
    }
  }, [key, shouldPlay]);

  return shouldPlay;
};
