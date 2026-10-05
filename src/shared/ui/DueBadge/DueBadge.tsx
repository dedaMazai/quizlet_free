import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, History } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './DueBadge.module.scss';

/** С этого числа слов бейдж становится срочным */
export const DUE_URGENT_THRESHOLD = 15;
const ICON_SIZE = 12;
const ICON_STROKE_WIDTH = 1.75;

interface DueBadgeProps {
    /** Слов к повторению; 0 — «Всё повторено» */
    count: number;
    className?: string;
}

/** Бейдж колоды: обычный · срочный (≥15) · «Всё повторено» */
export const DueBadge = memo((props: DueBadgeProps) => {
    const { count, className } = props;
    const { t } = useTranslation();

    if (count <= 0) {
        return (
            <span className={classNames(cls.DueBadge, [className, cls.clear])}>
                <Check aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} />
                {t('Всё повторено')}
            </span>
        );
    }

    const urgent = count >= DUE_URGENT_THRESHOLD;

    return (
        <span
            title={urgent ? t('Много слов ждут — повторите сегодня') : t('Слова, которые пора повторить')}
            className={classNames(cls.DueBadge, [className, urgent ? cls.urgent : cls.normal])}
        >
            <History aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} />
            {t('{{count}} к повторению', { count })}
        </span>
    );
});

DueBadge.displayName = 'DueBadge';
