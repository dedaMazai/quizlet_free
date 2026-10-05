import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Kicker } from '@/shared/ui/Kicker';
import { SessionButton, SessionButtonSize, SessionButtonVariant } from '@/shared/ui/SessionButton';
import { TickProgress, TickProgressSize, TickState } from '@/shared/ui/TickProgress';
import { ONBOARDING_STEPS_COUNT, OnboardingStep } from '../../model/onboarding';
import cls from './OnboardingHeader.module.scss';

interface OnboardingHeaderProps {
    step: OnboardingStep;
    onSkip: () => void;
}

const getTickState = (index: number, step: OnboardingStep): TickState => {
    if (index < step) return TickState.DONE;
    if (index === step) return TickState.CURRENT;
    return TickState.TODO;
};

/** Топбар онбординга: «Знакомство» · «Шаг N из 3» и 3 деления · «Пропустить» */
export const OnboardingHeader = memo((props: OnboardingHeaderProps) => {
    const { step, onSkip } = props;
    const { t } = useTranslation();

    const ticks = Array.from({ length: ONBOARDING_STEPS_COUNT }, (_, index) => getTickState(index, step));

    return (
        <header className={cls.OnboardingHeader}>
            <Kicker className={cls.brand}>{t('Знакомство')}</Kicker>
            <div className={cls.center}>
                <span className={cls.counter}>
                    {t('Шаг {{current}} из {{total}}', { current: step + 1, total: ONBOARDING_STEPS_COUNT })}
                </span>
                <TickProgress ticks={ticks} size={TickProgressSize.MD} />
            </div>
            <div className={cls.right}>
                <SessionButton variant={SessionButtonVariant.GHOST} size={SessionButtonSize.MD} onClick={onSkip}>
                    {t('Пропустить')}
                </SessionButton>
            </div>
        </header>
    );
});

OnboardingHeader.displayName = 'OnboardingHeader';
