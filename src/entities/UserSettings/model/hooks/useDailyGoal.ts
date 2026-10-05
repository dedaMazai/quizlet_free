import { DEFAULT_DAILY_GOAL } from '@/shared/const/const';
import { useGetUserPreferencesQuery } from '../api/userPreferencesApi';

/** Цель дня в карточках (ответах); пока настройки не загружены — значение по умолчанию */
export const useDailyGoal = (): number => {
    const { data } = useGetUserPreferencesQuery();
    return data?.dailyGoal ?? DEFAULT_DAILY_GOAL;
};
