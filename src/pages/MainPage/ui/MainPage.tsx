import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Typography } from 'antd';
import {
    AppstoreOutlined,
    UnorderedListOutlined,
    BulbOutlined,
} from '@ant-design/icons';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { useUserInfo } from '@/entities/User';
import { buildName } from '@/shared/lib/helpers/buildName';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './MainPage.module.scss';

const MainPage: FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userInfo = useUserInfo();

    const name = userInfo
        ? buildName({
            surname: userInfo.surname,
            name: userInfo.name,
            middle_name: userInfo.middle_name,
            language: userInfo.language,
        })
        : '';

    const actions = [
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
            key: 'learn',
            icon: <BulbOutlined />,
            title: t('Заучивание'),
            description: t('Выберите колоду и тренируйтесь'),
            onClick: () => navigate(RoutePath.DECKS()),
        },
    ];

    return (
        <VStack max gap="24">
            <VStack max gap="8">
                <Typography.Title level={2}>
                    {name ? t('Добро пожаловать, {{name}}', { name }) : t('Добро пожаловать')}
                </Typography.Title>
                <Typography.Paragraph type="secondary">
                    {t('Создавайте колоды слов и заучивайте их в режимах «Карточки» и «Заучивание».')}
                </Typography.Paragraph>
            </VStack>

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
        </VStack>
    );
};

export default MainPage;
