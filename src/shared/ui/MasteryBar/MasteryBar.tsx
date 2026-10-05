import { CSSProperties, memo, useRef } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useInViewport } from '@/shared/lib/hooks/useInViewport';
import { useOncePerDay } from '@/shared/lib/hooks/useOncePerDay';
import cls from './MasteryBar.module.scss';

/** С этого процента «усвоено» сегмент окрашивается сигналом «результат» */
export const MASTERY_SUCCESS_THRESHOLD = 80;

export enum MasteryBarSize {
    /** 5px — карточка библиотеки */
    SM = 'sm',
    /** 6px — карточка колоды на главной */
    MD = 'md',
    /** 10px — страница колоды */
    LG = 'lg',
    /** 28px — освоение слов на странице прогресса */
    XL = 'xl',
}

interface MasteryBarProps {
    /** Доля «усвоено», 0–100 */
    mastered: number;
    /** Доля «изучаю», 0–100; остаток — «новые» */
    learning: number;
    size?: MasteryBarSize;
    className?: string;
}

/** 3 сегмента: усвоено (accent-700) · изучаю (accent-400) · новые (neutral-300) */
export const MasteryBar = memo((props: MasteryBarProps) => {
    const {
        mastered,
        learning,
        size = MasteryBarSize.MD,
        className,
    } = props;
    const ref = useRef<HTMLDivElement>(null);
    // Заливка — «праздник»: раз в день, при первом появлении в viewport
    const celebrate = useOncePerDay('mastery');
    const seen = useInViewport(ref, celebrate);

    // Ширины — данные, а не оформление: передаём через CSS-переменные
    const vars = {
        '--mastered': `${mastered}%`,
        '--learning': `${learning}%`,
    } as CSSProperties;

    return (
        <div
            ref={ref}
            className={classNames(cls.MasteryBar, [className, cls[size]], {
                [cls.pending]: celebrate && !seen,
                [cls.play]: celebrate && seen,
            })}
            style={vars}
        >
            <div
                className={classNames(cls.mastered, [], {
                    [cls.success]: mastered >= MASTERY_SUCCESS_THRESHOLD,
                })}
            />
            <div className={cls.learning} />
            <div className={cls.fresh} />
        </div>
    );
});

MasteryBar.displayName = 'MasteryBar';
