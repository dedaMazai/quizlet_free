import { memo } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './Skeleton.module.scss';

interface SkeletonProps {
    /** Размеры задаёт родитель — геометрия как у итогового блока */
    className?: string;
}

/** Блок-заглушка с shimmer; проявляется, только если загрузка дольше 200 мс (BACKLOG §2) */
export const Skeleton = memo(({ className }: SkeletonProps) => (
    <span aria-hidden className={classNames(cls.Skeleton, [className])} />
));

Skeleton.displayName = 'Skeleton';
