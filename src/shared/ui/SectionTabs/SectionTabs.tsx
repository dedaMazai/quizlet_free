import { memo, ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './SectionTabs.module.scss';

export interface SectionTabItem {
    to: string;
    label: ReactNode;
    /** Короткая подпись для мобильного (Mobile 6.39–6.54) */
    shortLabel?: ReactNode;
    count?: ReactNode;
    /** Счётчик на плашке accent-100 (вкладка «К повторению») */
    countHighlighted?: boolean;
    /** Явная активность — когда вкладку отличает query-параметр, а не путь */
    active?: boolean;
}

interface SectionTabsProps {
    items: SectionTabItem[];
    className?: string;
}

/** Вкладки раздела — маршруты; активная подчёркнута accent */
export const SectionTabs = memo((props: SectionTabsProps) => {
    const { items, className } = props;
    const { isMobile } = useMatchMedia();

    return (
        <nav className={classNames(cls.SectionTabs, [className])}>
            {items.map(({
                to, label, shortLabel, count, countHighlighted, active,
            }) => {
                const content = (
                    <>
                        {isMobile && shortLabel ? shortLabel : label}
                        {count !== undefined && (
                            <span className={classNames(cls.count, [], { [cls.highlighted]: countHighlighted })}>
                                {count}
                            </span>
                        )}
                    </>
                );

                // Явная активность: NavLink иначе сам выставит aria-current по пути без учёта query
                return active === undefined
                    ? (
                        <NavLink
                            key={to}
                            to={to}
                            end
                            className={({ isActive }) => classNames(cls.tab, [], { [cls.active]: isActive })}
                        >
                            {content}
                        </NavLink>
                    )
                    : (
                        <Link
                            key={to}
                            to={to}
                            aria-current={active ? 'page' : undefined}
                            className={classNames(cls.tab, [], { [cls.active]: active })}
                        >
                            {content}
                        </Link>
                    );
            })}
        </nav>
    );
});

SectionTabs.displayName = 'SectionTabs';
