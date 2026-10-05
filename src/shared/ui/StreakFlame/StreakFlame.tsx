import { memo } from 'react';
import { Flame } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { getStreakLevel } from '@/shared/lib/streak';
import cls from './StreakFlame.module.scss';

/** С уровня «Жар» (индекс 3) иконка рисуется толще */
const BOLD_LEVEL_INDEX = 3;
const ICON_SIZE = 34;
const STROKE_WIDTH = 1.25;
const STROKE_WIDTH_BOLD = 1.75;
const LEVEL_CLASSES = [cls.level0, cls.level1, cls.level2, cls.level3, cls.level4];

interface StreakFlameProps {
    /** Дней серии подряд — определяет уровень огня */
    days: number;
    className?: string;
}

/** Иконка flame цветом уровня серии на подложке 56×56 */
export const StreakFlame = memo((props: StreakFlameProps) => {
    const { days, className } = props;
    const { index } = getStreakLevel(days);

    return (
        <div className={classNames(cls.StreakFlame, [className, LEVEL_CLASSES[index]])}>
            <Flame
                aria-hidden
                size={ICON_SIZE}
                strokeWidth={index >= BOLD_LEVEL_INDEX ? STROKE_WIDTH_BOLD : STROKE_WIDTH}
            />
        </div>
    );
});

StreakFlame.displayName = 'StreakFlame';
