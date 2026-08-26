import { ReactNode } from 'react';
import { MenuProps } from "antd";
import type { TFunction } from 'i18next';
import Icon, {
    HomeOutlined, AppstoreOutlined, UnorderedListOutlined, SettingOutlined,
    StarOutlined, LineChartOutlined, UserOutlined, HistoryOutlined,
    ReadOutlined, FieldTimeOutlined, SyncOutlined, CheckCircleOutlined,
    HourglassOutlined, OrderedListOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { filterValuesForAccess } from "@/entities/User";
import { RoutePath } from '@/shared/config/router/routePath';
import { Accesses } from "../types/accesses";

export type MenuItem = Required<MenuProps>['items'][number];

export interface NavItem {
    /** Путь; он же key для antd Menu и цель navigate. */
    key: string;
    label: string;
    icon: ReactNode;
    /** Активен только при точном совпадении pathname (нужно для '/'). */
    exact?: boolean;
}

/** Элемент конфига до фильтрации по доступам. */
type NavItemConfig = NavItem & { accesses?: Accesses[] };

export interface NavSection {
    key: string;
    /** Заголовок группы; у первой секции отсутствует. */
    label?: string;
    items: NavItem[];
}

/** Активен при точном совпадении либо когда путь — вложенный (граница по '/'). */
export const isNavItemActive = (pathname: string, item: NavItem): boolean => (
    item.exact
        ? pathname === item.key
        : pathname === item.key || pathname.startsWith(`${item.key}/`)
);

/** Единый источник правды для сайдбара и мобильного меню. */
export const getNavSections = ({
    t,
    userAccesses,
}: {
    t: TFunction
    userAccesses: Accesses[]
}): NavSection[] => {

    const sections: { key: string, label?: string, items: NavItemConfig[] }[] = [
        {
            key: 'main',
            items: [
                {
                    key: RoutePath.MAIN(),
                    label: t('Главная'),
                    icon: <Icon component={HomeOutlined} />,
                    exact: true,
                },
            ],
        },
        {
            key: 'study',
            label: t('Учить'),
            items: [
                {
                    key: RoutePath.REVIEW(),
                    label: t('К повторению'),
                    icon: <Icon component={HistoryOutlined} />,
                },
            ],
        },
        {
            key: 'grammar',
            label: t('Грамматика'),
            items: [
                {
                    key: RoutePath.GRAMMAR_TENSES(),
                    label: t('Времена: план и обзор'),
                    icon: <Icon component={ReadOutlined} />,
                    exact: true,
                },
                {
                    key: RoutePath.GRAMMAR_TENSE_GROUP('simple'),
                    label: 'Simple',
                    icon: <Icon component={FieldTimeOutlined} />,
                },
                {
                    key: RoutePath.GRAMMAR_TENSE_GROUP('continuous'),
                    label: 'Continuous',
                    icon: <Icon component={SyncOutlined} />,
                },
                {
                    key: RoutePath.GRAMMAR_TENSE_GROUP('perfect'),
                    label: 'Perfect',
                    icon: <Icon component={CheckCircleOutlined} />,
                },
                {
                    key: RoutePath.GRAMMAR_TENSE_GROUP('perfect-continuous'),
                    label: 'Perfect Continuous',
                    icon: <Icon component={HourglassOutlined} />,
                },
                {
                    key: RoutePath.GRAMMAR_PRACTICE(),
                    label: t('Практика времён'),
                    icon: <Icon component={ThunderboltOutlined} />,
                },
                {
                    key: RoutePath.IRREGULAR_VERBS(),
                    label: t('Неправильные глаголы'),
                    icon: <Icon component={OrderedListOutlined} />,
                },
            ],
        },
        {
            key: 'library',
            label: t('Библиотека'),
            items: [
                {
                    key: RoutePath.DECKS(),
                    label: t('Колоды'),
                    icon: <Icon component={AppstoreOutlined} />,
                },
                {
                    key: RoutePath.ALL_WORDS(),
                    label: t('Все слова'),
                    icon: <Icon component={UnorderedListOutlined} />,
                },
                {
                    key: RoutePath.FAVORITES(),
                    label: t('Избранное'),
                    icon: <Icon component={StarOutlined} />,
                },
            ],
        },
        {
            key: 'account',
            label: t('Аккаунт'),
            items: [
                {
                    key: RoutePath.PROGRESS(),
                    label: t('Прогресс'),
                    icon: <Icon component={LineChartOutlined} />,
                },
                {
                    key: RoutePath.PROFILE(),
                    label: t('Личный кабинет'),
                    icon: <Icon component={UserOutlined} />,
                },
                {
                    key: RoutePath.SETTINGS(),
                    label: t('Настройки'),
                    icon: <Icon component={SettingOutlined} />,
                },
            ],
        },
    ];

    return sections
        .map(({ items, ...rest }) => ({
            ...rest,
            items: filterValuesForAccess<NavItem>(items, userAccesses),
        }))
        .filter(({ items }) => items.length > 0);
};

/** Адаптер конфига в формат antd Menu (мобильное меню). */
export const getMenuItems = ({
    t,
    className,
    userAccesses,
}: {
    t: TFunction
    className?: string
    userAccesses: Accesses[]
}): MenuItem[] => (
    getNavSections({ t, userAccesses }).flatMap(({ key, label, items }): MenuItem[] => {
        const children = items.map((item) => ({
            key: item.key,
            label: item.label,
            icon: item.icon,
            className,
        }));

        return label
            ? [{ key, type: 'group' as const, label, children }]
            : children;
    })
);
