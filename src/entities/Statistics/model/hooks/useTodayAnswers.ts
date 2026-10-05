import { useGetStudyHeatmapQuery } from '../api/statisticsApi';
import { formatDayInTz } from '../lib/days';

/** Ответов за сегодня в часовом поясе пользователя — прогресс цели дня */
export const useTodayAnswers = (tz: string): number => {
  const { data: heatmap } = useGetStudyHeatmapQuery(tz);
  const today = formatDayInTz(new Date(), tz);
  return heatmap?.find((day) => day.date === today)?.count ?? 0;
};
