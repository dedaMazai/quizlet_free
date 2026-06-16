import { FC, memo, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './StatusTag.module.scss';

type StatusTagVariant = 'success' | 'warning' | 'default' | 'purple';

interface StatusTagProps {
    className?: string;
    variant?: StatusTagVariant;
    children: ReactNode;
}

export const StatusTag: FC<StatusTagProps> = memo((props) => {
    const { className, variant = 'default', children } = props;

    return (
        <span
            className={classNames(cls.StatusTag, [className, cls[variant]])}
        >
            {children}
        </span>
    );
});

StatusTag.displayName = 'StatusTag';
