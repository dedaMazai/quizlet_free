import {
    memo, ReactNode, useLayoutEffect, useRef,
} from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
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

interface IndicatorRect {
    x: number;
    width: number;
}

// Страница с вкладками перемонтируется при навигации — помним, где индикатор стоял, чтобы он доехал оттуда
const lastIndicator = new Map<string, IndicatorRect>();

const placeIndicator = (indicator: HTMLElement, rect: IndicatorRect) => {
    indicator.style.setProperty('--x', `${rect.x}px`);
    indicator.style.setProperty('--w', String(rect.width));
};

/** Вкладки раздела — маршруты; активная подчёркнута accent, индикатор скользит между ними */
export const SectionTabs = memo((props: SectionTabsProps) => {
    const { items, className } = props;
    const { isMobile } = useMatchMedia();
    const { pathname, search } = useLocation();
    const navRef = useRef<HTMLElement>(null);
    const indicatorRef = useRef<HTMLSpanElement>(null);
    const setKey = items.map((item) => item.to).join('|');

    useLayoutEffect(() => {
        const nav = navRef.current;
        const indicator = indicatorRef.current;
        if (!nav || !indicator) return undefined;

        const measure = (): IndicatorRect | null => {
            const tab = nav.querySelector<HTMLElement>('[aria-current="page"]');

            return tab ? { x: tab.offsetLeft, width: tab.offsetWidth } : null;
        };

        const target = measure();
        indicator.classList.toggle(cls.indicatorHidden, !target);
        if (!target) return undefined;

        const previous = lastIndicator.get(setKey);
        indicator.classList.remove(cls.indicatorMoving);
        placeIndicator(indicator, previous ?? target);
        lastIndicator.set(setKey, target);

        if (previous && (previous.x !== target.x || previous.width !== target.width)) {
            // Фиксируем старое положение принудительным reflow, затем переход к новому
            indicator.getBoundingClientRect();
            indicator.classList.add(cls.indicatorMoving);
            placeIndicator(indicator, target);
        }

        // Шрифты, догрузка счётчиков и ресайз меняют ширину вкладок — переставляем индикатор
        const observer = new ResizeObserver(() => {
            const rect = measure();
            if (!rect) return;
            lastIndicator.set(setKey, rect);
            placeIndicator(indicator, rect);
        });
        nav.querySelectorAll('a').forEach((tab) => observer.observe(tab));

        return () => observer.disconnect();
    }, [setKey, pathname, search, isMobile]);

    return (
        <nav ref={navRef} className={classNames(cls.SectionTabs, [className])}>
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
            <span ref={indicatorRef} className={cls.indicator} aria-hidden />
        </nav>
    );
});

SectionTabs.displayName = 'SectionTabs';
