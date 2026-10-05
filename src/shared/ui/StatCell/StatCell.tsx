import { memo, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './StatCell.module.scss';

export enum StatCellTone {
    /** Подпись neutral-700 */
    NEUTRAL = 'neutral',
    /** Рост ▲ — сигнал «результат» */
    SUCCESS = 'success',
    /** Серия: число и подпись цветом уровня 0…4 */
    STREAK_0 = 'streak0',
    STREAK_1 = 'streak1',
    STREAK_2 = 'streak2',
    STREAK_3 = 'streak3',
    STREAK_4 = 'streak4',
}

const TONE_CLASSES: Record<StatCellTone, string | undefined> = {
    [StatCellTone.NEUTRAL]: undefined,
    [StatCellTone.SUCCESS]: cls.success,
    [StatCellTone.STREAK_0]: cls.streak0,
    [StatCellTone.STREAK_1]: cls.streak1,
    [StatCellTone.STREAK_2]: cls.streak2,
    [StatCellTone.STREAK_3]: cls.streak3,
    [StatCellTone.STREAK_4]: cls.streak4,
};

interface StatCellProps {
    label: ReactNode;
    value: ReactNode;
    unit?: ReactNode;
    delta?: ReactNode;
    tone?: StatCellTone;
    className?: string;
}

/** Ячейка KPI-полосы. Соседние ячейки разделяются линией слева */
export const StatCell = memo((props: StatCellProps) => {
    const {
        label,
        value,
        unit,
        delta,
        tone = StatCellTone.NEUTRAL,
        className,
    } = props;

    return (
        <div className={classNames(cls.StatCell, [className, TONE_CLASSES[tone]])}>
            <span className={cls.label}>{label}</span>
            <div className={cls.row}>
                <span className={cls.value}>{value}</span>
                {unit && <span className={cls.unit}>{unit}</span>}
            </div>
            {delta && <span className={cls.delta}>{delta}</span>}
        </div>
    );
});

StatCell.displayName = 'StatCell';
