import { memo, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './Kicker.module.scss';

export enum KickerSize {
    /** 10px, ls .12em */
    SM = 'sm',
    /** 11px, ls .14em */
    MD = 'md',
}

export enum KickerTone {
    /** neutral-700 */
    DEFAULT = 'default',
    /** accent-700 — кикер карточки */
    ACCENT = 'accent',
    /** accent-300 — на тёмном поле */
    ON_DARK = 'onDark',
}

interface KickerProps {
    size?: KickerSize;
    tone?: KickerTone;
    className?: string;
    children: ReactNode;
}

/** Моно-метка: JetBrains Mono, UPPERCASE */
export const Kicker = memo((props: KickerProps) => {
    const {
        size = KickerSize.MD,
        tone = KickerTone.DEFAULT,
        className,
        children,
    } = props;

    return (
        <span className={classNames(cls.Kicker, [className, cls[size], cls[tone]])}>
            {children}
        </span>
    );
});

Kicker.displayName = 'Kicker';
