/** Названия уровней серии по индексу getStreakLevel (README §1) */
export const STREAK_LEVEL_NAMES = ['Искра', 'Огонёк', 'Пламя', 'Жар', 'Пожар'] as const;

export const WEEK_DAYS = 7;
const DAY_MS = 86_400_000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const MS_IN_SECOND = 1000;

/** YYYY-MM-DD в часовом поясе пользователя — формат дат heatmap */
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

/** 460 000 мс → «7:40»; от часа — «1:07:40» */
export const formatDuration = (ms: number): string => {
    const totalSeconds = Math.round(ms / MS_IN_SECOND);
    const seconds = totalSeconds % SECONDS_IN_MINUTE;
    const totalMinutes = Math.floor(totalSeconds / SECONDS_IN_MINUTE);
    const minutes = totalMinutes % MINUTES_IN_HOUR;
    const hours = Math.floor(totalMinutes / MINUTES_IN_HOUR);
    const pad = (value: number) => String(value).padStart(2, '0');
    return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${totalMinutes}:${pad(seconds)}`;
};
