import { memo } from 'react';
import { useDailyGoal, useUpdateUserPreferencesMutation } from '@/entities/UserSettings';
import { DAILY_GOAL_OPTIONS } from '@/shared/const/const';
import { useToast } from '@/shared/lib/toast';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';
import { useTranslation } from 'react-i18next';

/** Выбор цели дня: сколько карточек повторять в день */
export const DailyGoalSwitcher = memo(() => {
    const { t } = useTranslation();
    const toast = useToast();
    const goal = useDailyGoal();
    const [updatePreferences] = useUpdateUserPreferencesMutation();

    const handleChange = async (dailyGoal: number) => {
        try {
            await updatePreferences({ dailyGoal }).unwrap();
        } catch {
            toast.error(t('Не удалось сохранить цель дня'));
        }
    };

    return (
        <BoxSegmented<number>
            value={goal}
            onChange={handleChange}
            options={DAILY_GOAL_OPTIONS.map((value) => ({ label: String(value), value }))}
        />
    );
});

DailyGoalSwitcher.displayName = 'DailyGoalSwitcher';
