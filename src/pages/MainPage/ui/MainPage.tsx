import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';
import { VStack } from '@/shared/ui/Stack';
import { useUserInfo } from '@/entities/User';
import { buildName } from '@/shared/lib/helpers/buildName';

const MainPage: FC = () => {
    const { t } = useTranslation();
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
                {t('Это стартовая страница приложения.')}
            </Typography.Paragraph>
        </VStack>
    );
};

export default MainPage;
