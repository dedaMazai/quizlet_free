import { memo } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './TickProgress.module.scss';

export enum TickState {
    /** accent-700 — пройдено */
    DONE = 'done',
    /** сигнал «верно» */
    CORRECT = 'correct',
    /** сигнал «неверно» + штриховка */
    WRONG = 'wrong',
    /** accent-400 — текущий */
    CURRENT = 'current',
    /** neutral-300 — впереди */
    TODO = 'todo',
}

export enum TickProgressSize {
    /** 3px — освоенность времени в матрице грамматики */
    XS = 'xs',
    /** 6px — карточки «Следующий шаг» */
    SM = 'sm',
    /** 8px — топбар сессии, практика */
    MD = 'md',
}

interface TickProgressProps {
    ticks: TickState[];
    size?: TickProgressSize;
    className?: string;
}

/** Прогресс из N делений */
export const TickProgress = memo((props: TickProgressProps) => {
    const { ticks, size = TickProgressSize.MD, className } = props;

    return (
        <div className={classNames(cls.TickProgress, [className, cls[size]])}>
            {ticks.map((state, i) => (
                // Деления не переупорядочиваются — индекс стабилен
                <i key={i} className={classNames(cls.tick, [cls[state]])} />
            ))}
        </div>
    );
});

TickProgress.displayName = 'TickProgress';
