import { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from 'antd';
import {
    AppstoreOutlined,
    UnorderedListOutlined,
    StarOutlined,
    BulbOutlined,
} from '@ant-design/icons';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './QuickActions.module.scss';

interface ActionItem {
    key: string;
    icon: ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

export const QuickActions: FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const actions: ActionItem[] = [
        {
            key: 'decks',
            icon: <AppstoreOutlined />,
            title: t('Мои колоды'),
            description: t('Просматривайте и создавайте колоды'),
            onClick: () => navigate(RoutePath.DECKS()),
        },
        {
            key: 'words',
            icon: <UnorderedListOutlined />,
            title: t('Все слова'),
            description: t('Все слова в одном списке'),
            onClick: () => navigate(RoutePath.ALL_WORDS()),
        },
        {
            key: 'favorites',
            icon: <StarOutlined />,
            title: t('Избранное'),
            description: t('Слова, которые вы отметили'),
            onClick: () => navigate(RoutePath.FAVORITES()),
        },
        {
            key: 'learn',
            icon: <BulbOutlined />,
            title: t('Заучивание'),
            description: t('Выберите колоду и тренируйтесь'),
            onClick: () => navigate(RoutePath.DECKS()),
        },
    ];

    return (
        <div className={cls.grid}>
            {actions.map((action) => (
                <Card
                    key={action.key}
                    variant="borderless"
                    className={cls.card}
                    onClick={action.onClick}
                >
                    <HStack gap="16" align="center">
                        <div className={cls.iconBox}>{action.icon}</div>
                        <VStack gap="2">
                            <MyTypography.Large strong>{action.title}</MyTypography.Large>
                            <MyTypography.Small type="secondary">
                                {action.description}
                            </MyTypography.Small>
                        </VStack>
                    </HStack>
                </Card>
            ))}
        </div>
    );
};
