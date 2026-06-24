import { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from 'antd';
import {
    AppstoreOutlined,
    UnorderedListOutlined,
    StarOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './StatsStrip.module.scss';

interface StatsStripProps {
    decksCount: number;
    wordsCount: number;
    favoritesCount: number;
    sharedCount: number;
}

interface StatCard {
    key: string;
    icon: ReactNode;
    value: number;
    label: string;
    onClick: () => void;
}

export const StatsStrip: FC<StatsStripProps> = (props) => {
    const {
        decksCount, wordsCount, favoritesCount, sharedCount,
    } = props;
    const { t } = useTranslation();
    const navigate = useNavigate();

    const stats: StatCard[] = [
        {
            key: 'decks',
            icon: <AppstoreOutlined />,
            value: decksCount,
            label: t('Колоды'),
            onClick: () => navigate(RoutePath.DECKS()),
        },
        {
            key: 'words',
            icon: <UnorderedListOutlined />,
            value: wordsCount,
            label: t('Всего слов'),
            onClick: () => navigate(RoutePath.ALL_WORDS()),
        },
        {
            key: 'favorites',
            icon: <StarOutlined />,
            value: favoritesCount,
            label: t('Избранное'),
            onClick: () => navigate(RoutePath.FAVORITES()),
        },
        {
            key: 'shared',
            icon: <TeamOutlined />,
            value: sharedCount,
            label: t('Доступные мне'),
            onClick: () => navigate(RoutePath.DECKS()),
        },
    ];

    return (
        <div className={cls.grid}>
            {stats.map((stat) => (
                <Card
                    key={stat.key}
                    variant="borderless"
                    className={cls.card}
                    onClick={stat.onClick}
                >
                    <HStack gap="16" align="center">
                        <div className={cls.iconBox}>{stat.icon}</div>
                        <VStack gap="2">
                            <MyTypography.Large strong>{stat.value}</MyTypography.Large>
                            <MyTypography.Small type="secondary">{stat.label}</MyTypography.Small>
                        </VStack>
                    </HStack>
                </Card>
            ))}
        </div>
    );
};
