import { memo, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDailyGoal, useUpdateUserPreferencesMutation } from '@/entities/UserSettings';
import { DAILY_GOAL_OPTIONS } from '@/shared/const/const';
import { useToast } from '@/shared/lib/toast';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';
import { SessionButton } from '@/shared/ui/SessionButton';
import { SessionStage } from '@/shared/ui/SessionStage';
import { estimateGoalMinutes } from '../../model/onboarding';
import cls from '../OnboardingPage.module.scss';
import goalCls from './GoalStep.module.scss';

interface GoalStepProps {
    header: ReactNode;
    onNext: () => void;
}

/** Шаг 1: цель дня — 10 / 20 / 30 / 50 карточек */
export const GoalStep = memo((props: GoalStepProps) => {
    const { header, onNext } = props;
    const { t } = useTranslation();
    const toast = useToast();
    const savedGoal = useDailyGoal();
    const [updatePreferences, { isLoading }] = useUpdateUserPreferencesMutation();
    const [goal, setGoal] = useState<number>();
    const selected = goal ?? savedGoal;

    const handleNext = async () => {
        try {
            await updatePreferences({ dailyGoal: selected }).unwrap();
        } catch {
            // Цель не критична для онбординга: её можно задать позже в настройках
            toast.error(t('Не удалось сохранить цель дня'));
        }
        onNext();
    };

    return (
        <>
            {header}
            <SessionStage>
                <div className={cls.head}>
                    <Kicker tone={KickerTone.ACCENT}>{t('Цель дня')}</Kicker>
                    <h1 className={cls.title}>{t('Сколько карточек в день?')}</h1>
                    <p className={cls.text}>{t('Цель можно поменять в настройках.')}</p>
                </div>
                <BoxSegmented<number>
                    block
                    className={goalCls.goals}
                    value={selected}
                    onChange={setGoal}
                    options={DAILY_GOAL_OPTIONS.map((value) => ({
                        value,
                        label: (
                            <span className={goalCls.option}>
                                <span className={goalCls.count}>{value}</span>
                                <span className={goalCls.minutes}>
                                    {t('≈ {{count}} мин', { count: estimateGoalMinutes(value) })}
                                </span>
                            </span>
                        ),
                    }))}
                />
                <SessionButton className={cls.cta} disabled={isLoading} onClick={handleNext}>
                    {t('Далее')}
                </SessionButton>
            </SessionStage>
        </>
    );
});

GoalStep.displayName = 'GoalStep';
