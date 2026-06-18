import { MenuProps } from "antd";
import type { TFunction } from 'i18next';
import Icon, {
    HomeOutlined, AppstoreOutlined, UnorderedListOutlined, SettingOutlined,
} from '@ant-design/icons';
import { filterValuesForAccess } from "@/entities/User";
import { RoutePath } from '@/shared/config/router/routePath';
import { Accesses } from "../types/accesses";

export type MenuItem = Required<MenuProps>['items'][number];

export const getMenuItems = ({
    t,
    className,
    userAccesses,
}: {
    t: TFunction
    className?: string
    userAccesses: Accesses[]
}): MenuItem[] => {

    return (
        filterValuesForAccess(
            [
                {
                    key: RoutePath.MAIN(),
                    label: t('Главная'),
                    icon: <Icon component={HomeOutlined} />,
                    className,
                },
                {
                    key: RoutePath.DECKS(),
                    label: t('Колоды'),
                    icon: <Icon component={AppstoreOutlined} />,
                    className,
                },
                {
                    key: RoutePath.ALL_WORDS(),
                    label: t('Все слова'),
                    icon: <Icon component={UnorderedListOutlined} />,
                    className,
                },
                {
                    key: RoutePath.SETTINGS(),
                    label: t('Настройки'),
                    icon: <Icon component={SettingOutlined} />,
                    className,
                },
            ],
            userAccesses
        )
    )
};
