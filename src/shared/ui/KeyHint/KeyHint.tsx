import { memo, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './KeyHint.module.scss';

export enum KeyHintTone {
    /** 10px, neutral-600 — на светлой кнопке */
    MUTED = 'muted',
    /** 11px, цвет кнопки с opacity .8 — на primary-кнопке */
    INHERIT = 'inherit',
}

interface KeyHintProps {
    tone?: KeyHintTone;
    className?: string;
    children: ReactNode;
}

/** Подпись клавиши рядом с действием: «ESC», «ENTER» */
export const KeyHint = memo((props: KeyHintProps) => {
    const { tone = KeyHintTone.MUTED, className, children } = props;

    return <span className={classNames(cls.KeyHint, [className, cls[tone]])}>{children}</span>;
});

KeyHint.displayName = 'KeyHint';
