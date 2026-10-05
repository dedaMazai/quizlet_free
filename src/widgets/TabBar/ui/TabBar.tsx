import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { useGetDueCountQuery } from '@/entities/Card';
import { classNames } from '@/shared/lib/classNames/classNames';
import { getNavSections, isNavSectionActive, NavSectionKey } from '@/shared/const/menu';
import cls from './TabBar.module.scss';

const TAB_ICON_SIZE = 22;
const TAB_ICON_STROKE = 1.5;

/** Нижний таб-бар мобильной версии: 5 разделов, бейдж долга на «Учить» (Mobile 6.35) */
export const TabBar = memo(() => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const sections = useMemo(() => getNavSections({ t }), [t]);
    const { data: due } = useGetDueCountQuery(undefined);
    const dueCount = due?.count ?? 0;

    return (
        <nav className={cls.TabBar} aria-label={t('Разделы')}>
            {sections.map((section) => {
                const { key, Icon, label, path } = section;
                const isActive = isNavSectionActive(pathname, section);

                return (
                    <Link
                        key={key}
                        to={path}
                        aria-current={isActive ? 'page' : undefined}
                        className={classNames(cls.item, [], { [cls.active]: isActive })}
                    >
                        <Icon aria-hidden size={TAB_ICON_SIZE} strokeWidth={TAB_ICON_STROKE} />
                        <span className={cls.label}>{label}</span>
                        {key === NavSectionKey.LEARN && dueCount > 0 && (
                            <span className={cls.badge}>{dueCount}</span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
});

TabBar.displayName = 'TabBar';
