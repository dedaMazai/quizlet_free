import {
    Fragment, memo, useCallback, useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { Button, Tooltip } from 'antd';
import { BrowserView, isBrowser } from 'react-device-detect';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetDueCountQuery } from '@/entities/Card';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { ReactComponent as Logo } from '@/shared/assets/icons/LogoZubrika.svg';
import { RoutePath } from '@/shared/config/router/routePath';
import {
    getNavSections, isNavSectionActive, NavSection, NavSectionKey,
} from '@/shared/const/menu';
import { LOCAL_STORAGE_SIDEBAR_COLLAPSED_KEY } from '@/shared/const/localstorage';
import { SidebarReviewCard } from '../SidebarReviewCard/SidebarReviewCard';
import { SidebarProfile } from '../SidebarProfile/SidebarProfile';
import cls from './Sidebar.module.scss';

const APP_NAME = 'Zubrika';

/** Сайдбар: 236px развёрнут, 76px rail, без ресайза (Shell 6.1, README §2) */
export const Sidebar = memo(() => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useLocalStorage(LOCAL_STORAGE_SIDEBAR_COLLAPSED_KEY, false);

    const sections = useMemo(() => getNavSections({ t }), [t]);

    // Тело исполняется и на мобиле (BrowserView внутри return) — там запрос не нужен
    const { data: due } = useGetDueCountQuery(undefined, { skip: !isBrowser });
    const dueCount = due?.count ?? 0;

    const toggleCollapsed = useCallback(() => {
        setCollapsed((prev) => !prev);
    }, [setCollapsed]);

    const showReviewCard = !collapsed && dueCount > 0 && pathname !== RoutePath.REVIEW();

    const renderItem = (section: NavSection) => {
        const isActive = isNavSectionActive(pathname, section);
        const hasBadge = section.key === NavSectionKey.LEARN && dueCount > 0;

        const link = (
            <Link
                to={section.path}
                aria-label={collapsed ? section.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={classNames(cls.item, [], { [cls.active]: isActive })}
            >
                <span className={cls.icon}>
                    {section.icon}
                    {collapsed && hasBadge && <span className={cls.dot} />}
                </span>
                {!collapsed && <span className={cls.label}>{section.label}</span>}
                {!collapsed && hasBadge && <span className={cls.badge}>{dueCount}</span>}
            </Link>
        );

        return collapsed
            ? <Tooltip key={section.key} title={section.label} placement="right">{link}</Tooltip>
            : <Fragment key={section.key}>{link}</Fragment>;
    };

    return (
        <BrowserView renderWithFragment>
            <aside className={classNames(cls.Sidebar, [], { [cls.collapsed]: collapsed })}>
                <div className={cls.header}>
                    <Link to={RoutePath.MAIN()} className={cls.logo} aria-label={APP_NAME}>
                        <Logo className={cls.logoIcon} />
                        {!collapsed && <span className={cls.logoText}>{APP_NAME}</span>}
                    </Link>
                    <Button
                        type="text"
                        className={cls.collapseBtn}
                        aria-label={collapsed ? t('Развернуть меню') : t('Свернуть меню')}
                        icon={collapsed
                            ? <ChevronRight size={16} strokeWidth={1.5} />
                            : <ChevronLeft size={16} strokeWidth={1.5} />}
                        onClick={toggleCollapsed}
                    />
                </div>

                <nav className={cls.nav}>
                    {sections.map(renderItem)}
                </nav>

                <div className={cls.bottom}>
                    {showReviewCard && <SidebarReviewCard count={dueCount} />}
                    <SidebarProfile collapsed={collapsed} />
                </div>
            </aside>
        </BrowserView>
    );
});

Sidebar.displayName = 'Sidebar';
