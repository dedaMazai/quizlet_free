import { ReactNode } from 'react';
import { MenuProps } from "antd";
import type { TFunction } from 'i18next';
import { matchPath } from 'react-router';
import {
    BookOpen, ChartLine, GraduationCap, House, Library,
} from 'lucide-react';
import { RoutePath } from '@/shared/config/router/routePath';
import type { SectionTabItem } from '@/shared/ui/SectionTabs';

export type MenuItem = Required<MenuProps>['items'][number];

export enum NavSectionKey {
    HOME = 'home',
    LEARN = 'learn',
    LIBRARY = 'library',
    GRAMMAR = 'grammar',
    PROGRESS = 'progress',
}

const NAV_ICON_SIZE = 18;
const NAV_ICON_STROKE = 1.5;

export interface NavSection {
    key: NavSectionKey;
    label: string;
    icon: ReactNode;
    /** Куда ведёт пункт сайдбара */
    path: string;
    /** Паттерны маршрутов, на которых раздел подсвечен (вложенные пути тоже) */
    match: string[];
    /** Подсвечивать только при точном совпадении (нужно для '/') */
    exact?: boolean;
    /** Вкладки раздела (SectionTabs) */
    tabs?: SectionTabItem[];
}

/** Единый источник правды для сайдбара, мобильного меню и вкладок разделов (README §2). */
export const getNavSections = ({ t }: { t: TFunction }): NavSection[] => {
    const iconProps = { size: NAV_ICON_SIZE, strokeWidth: NAV_ICON_STROKE };

    return [
        {
            key: NavSectionKey.HOME,
            label: t('Главная'),
            icon: <House {...iconProps} />,
            path: RoutePath.MAIN(),
            match: [RoutePath.MAIN()],
            exact: true,
        },
        {
            key: NavSectionKey.LEARN,
            label: t('Учить'),
            icon: <GraduationCap {...iconProps} />,
            path: RoutePath.REVIEW(),
            match: [
                RoutePath.REVIEW(),
                RoutePath.CYCLES(),
                RoutePath.ROADMAP(),
                RoutePath.GRAMMAR_TOPIC(':topic'),
            ],
            tabs: [
                { to: RoutePath.REVIEW(), label: t('К повторению') },
                { to: RoutePath.CYCLES(), label: t('Циклы заучивания') },
                { to: RoutePath.ROADMAP(), label: t('Дорожная карта') },
            ],
        },
        {
            key: NavSectionKey.LIBRARY,
            label: t('Библиотека'),
            icon: <Library {...iconProps} />,
            path: RoutePath.DECKS(),
            match: [
                RoutePath.DECKS(),
                RoutePath.ALL_WORDS(),
                RoutePath.FAVORITES(),
            ],
            tabs: [
                { to: RoutePath.DECKS(), label: t('Колоды') },
                { to: RoutePath.ALL_WORDS(), label: t('Все слова') },
                { to: RoutePath.FAVORITES(), label: t('Избранное') },
            ],
        },
        {
            key: NavSectionKey.GRAMMAR,
            label: t('Грамматика'),
            icon: <BookOpen {...iconProps} />,
            path: RoutePath.GRAMMAR_TENSES(),
            match: [
                RoutePath.GRAMMAR_TENSES(),
                RoutePath.GRAMMAR_PRACTICE(),
                RoutePath.IRREGULAR_VERBS(),
            ],
            tabs: [
                { to: RoutePath.GRAMMAR_TENSES(), label: t('Времена') },
                { to: RoutePath.GRAMMAR_PRACTICE(), label: t('Практика времён') },
                { to: RoutePath.IRREGULAR_VERBS(), label: t('Неправильные глаголы') },
            ],
        },
        {
            key: NavSectionKey.PROGRESS,
            label: t('Прогресс'),
            icon: <ChartLine {...iconProps} />,
            path: RoutePath.PROGRESS(),
            match: [RoutePath.PROGRESS()],
        },
    ];
};

/** Раздел подсвечен, если pathname совпадает с одним из match (или вложен в него). */
export const isNavSectionActive = (pathname: string, section: NavSection): boolean => (
    section.match.some((path) => matchPath({ path, end: !!section.exact }, pathname))
);

export const getActiveSection = (
    pathname: string,
    sections: NavSection[],
): NavSection | undefined => sections.find((section) => isNavSectionActive(pathname, section));

/** Адаптер конфига в формат antd Menu (мобильное меню). */
export const getMenuItems = ({
    t,
    className,
}: {
    t: TFunction
    className?: string
}): MenuItem[] => (
    getNavSections({ t }).map(({ path, label, icon }) => ({
        key: path,
        label,
        icon,
        className,
    }))
);
