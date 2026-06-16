import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useUserInfo } from '@/entities/User';
import { buildName } from '@/shared/lib/helpers/buildName';
import { RoutePath } from '@/shared/config/router/routePath';

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

    return (
        <VStack max gap="16">
            <Typography.Title level={2}>
                {name ? t('Добро пожаловать, {{name}}', { name }) : t('Добро пожаловать')}
            </Typography.Title>
            <Typography.Paragraph type="secondary">
                {t('Создавайте колоды слов и заучивайте их в режимах «Карточки» и «Заучивание».')}
            </Typography.Paragraph>
            <HStack gap="12" wrap>
                <Button
                    type="primary"
                    icon={<AppstoreOutlined />}
                    onClick={() => navigate(RoutePath.DECKS())}
                >
                    {t('Мои колоды')}
                </Button>
                <Button
                    icon={<UnorderedListOutlined />}
                    onClick={() => navigate(RoutePath.ALL_WORDS())}
                >
                    {t('Все слова')}
                </Button>
            </HStack>
        </VStack>
    );
};

export default MainPage;
