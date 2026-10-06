import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Blueprint, BlueprintCorners } from '@/shared/ui/Blueprint';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';

import cls from './FinalCtaSection.module.scss';

const ARROW_SIZE = 18;

interface FinalCtaSectionProps {
    ctaLabel: string;
    onStart: () => void;
}

/** Финальный призыв на тёмном поле */
export const FinalCtaSection = memo(({ ctaLabel, onStart }: FinalCtaSectionProps) => {
    const { t } = useTranslation();

    const steps = [
        t('Регистрация по email'),
        t('Цель на день и первая колода'),
        t('Первые 20 карточек — и вы в ритме'),
    ];

    return (
        <section className={cls.FinalCtaSection}>
            <div className={cls.main}>
                <Kicker tone={KickerTone.ON_DARK}>{t('Начать — 2 минуты')}</Kicker>
                <h2 className={cls.title}>{t('Первая колода — уже сегодня. Первое «я это помню» — через неделю.')}</h2>
                <ol className={cls.steps}>
                    {steps.map((step, i) => (
                        <li key={step} className={cls.step}>
                            <span className={cls.stepIndex}>{String(i + 1).padStart(2, '0')}</span>
                            {step}
                        </li>
                    ))}
                </ol>
            </div>
            <Blueprint as="button" type="button" corners={BlueprintCorners.LIGHT} className={cls.cta} onClick={onStart}>
                {ctaLabel}
                <ArrowRight size={ARROW_SIZE} aria-hidden />
            </Blueprint>
        </section>
    );
});

FinalCtaSection.displayName = 'FinalCtaSection';
