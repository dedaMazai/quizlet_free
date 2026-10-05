import { useEffect, useState } from 'react';
import { formatDayInTz } from '../lib/days';

const CHECK_INTERVAL_MS = 60_000;

/** Сегодняшний день YYYY-MM-DD в поясе tz; обновляется, когда наступает новый день */
export const useTodayKey = (tz: string): string => {
  const [today, setToday] = useState(() => formatDayInTz(new Date(), tz));

  useEffect(() => {
    const sync = () => setToday(formatDayInTz(new Date(), tz));
    sync();
    const id = window.setInterval(sync, CHECK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [tz]);

  return today;
};
