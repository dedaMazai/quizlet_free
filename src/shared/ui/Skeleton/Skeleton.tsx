import { memo, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './Skeleton.module.scss';

export enum SkeletonTone {
    /** neutral-200 / neutral-100 */
    DEFAULT = 'default',
    /** accent-800 / accent-700 — на тёмном поле */
    ON_DARK = 'onDark',
}

interface SkeletonProps {
    /** Размеры задаёт родитель — геометрия как у итогового блока */
    className?: string;
    tone?: SkeletonTone;
}

/** Блок-заглушка с shimmer; проявляется, только если загрузка дольше 200 мс (BACKLOG §2) */
export const Skeleton = memo(({ className, tone = SkeletonTone.DEFAULT }: SkeletonProps) => (
    <span
        aria-hidden
        className={classNames(cls.Skeleton, [className], { [cls.onDark]: tone === SkeletonTone.ON_DARK })}
    />
));

Skeleton.displayName = 'Skeleton';

interface FadeInProps {
    className?: string;
    children: ReactNode;
}

/** Появление данных после скелетона: opacity 0→1 за motion-base */
export const FadeIn = memo(({ className, children }: FadeInProps) => (
    <div className={classNames(cls.FadeIn, [className])}>{children}</div>
));

FadeIn.displayName = 'FadeIn';
