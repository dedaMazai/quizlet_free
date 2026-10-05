import { memo, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './SessionStage.module.scss';

export enum SessionStageGap {
    /** 28px — карточки */
    SM = 'sm',
    /** 32px — письмо */
    MD = 'md',
    /** 36px — пропуски, сборка фразы */
    LG = 'lg',
    /** 40px — выбор перевода */
    XL = 'xl',
}

interface SessionStageProps {
    gap?: SessionStageGap;
    className?: string;
    children: ReactNode;
}

/** Тело экрана занятия под топбаром: колонка по центру */
export const SessionStage = memo((props: SessionStageProps) => {
    const { gap = SessionStageGap.LG, className, children } = props;

    return <div className={classNames(cls.SessionStage, [className, cls[gap]])}>{children}</div>;
});

SessionStage.displayName = 'SessionStage';
