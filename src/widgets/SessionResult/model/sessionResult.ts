const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const MS_IN_SECOND = 1000;

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
