import { memo, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './SectionTabs.module.scss';

export interface SectionTabItem {
    to: string;
    label: ReactNode;
    count?: ReactNode;
    /** Счётчик на плашке accent-100 (вкладка «К повторению») */
    countHighlighted?: boolean;
}

interface SectionTabsProps {
    items: SectionTabItem[];
    className?: string;
}

/** Вкладки раздела — маршруты; активная подчёркнута accent */
export const SectionTabs = memo((props: SectionTabsProps) => {
    const { items, className } = props;

    return (
        <nav className={classNames(cls.SectionTabs, [className])}>
            {items.map(({
                to, label, count, countHighlighted,
            }) => (
                <NavLink
                    key={to}
                    to={to}
                    end
                    className={({ isActive }) => classNames(cls.tab, [], { [cls.active]: isActive })}
                >
                    {label}
                    {count !== undefined && (
                        <span className={classNames(cls.count, [], { [cls.highlighted]: countHighlighted })}>
                            {count}
                        </span>
                    )}
                </NavLink>
            ))}
        </nav>
    );
});

SectionTabs.displayName = 'SectionTabs';
