import { memo } from 'react';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Skeleton } from '@/shared/ui/Skeleton';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './DeckCard.module.scss';

interface DeckCardSkeletonProps {
    className?: string;
}

/** Скелетон карточки колоды — та же геометрия, что у DeckCard */
export const DeckCardSkeleton = memo(({ className }: DeckCardSkeletonProps) => (
    <div className={classNames(cls.DeckCard, [className])}>
        <Blueprint className={cls.card}>
            <div className={cls.head}>
                <Skeleton className={cls.nameSkeleton} />
                <Skeleton className={cls.badgeSkeleton} />
            </div>
            <div className={cls.progress}>
                <Skeleton className={cls.barSkeleton} />
                <Skeleton className={cls.statsSkeleton} />
            </div>
        </Blueprint>
    </div>
));

DeckCardSkeleton.displayName = 'DeckCardSkeleton';
