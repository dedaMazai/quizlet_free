export const WEEK_DAYS = 7;
const DAY_MS = 86_400_000;

/** YYYY-MM-DD в часовом поясе пользователя — формат дат heatmap и прогноза */
export const formatDayInTz = (date: Date, tz: string): string => new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
}).format(date);

/** Последние 7 дней, сегодня — последний */
export const lastWeekDates = (now: number): Date[] => Array.from(
    { length: WEEK_DAYS },
    (_, i) => new Date(now - (WEEK_DAYS - 1 - i) * DAY_MS),
);

/** «2026-10-05» → «ПН» / «П»: день недели календарной даты без сдвига часового пояса */
export const formatDayWeekday = (
    day: string,
    locale: string,
    weekday: 'short' | 'narrow',
): string => new Intl.DateTimeFormat(locale, { weekday, timeZone: 'UTC' })
    .format(new Date(`${day}T12:00:00Z`))
    .replace('.', '')
    .toUpperCase();
