import { Button, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { VStack } from '@/shared/ui/Stack';
import { RoutePath } from '@/shared/config/router/routePath';
import { MyTypography } from '@/shared/ui/MyTypography';

const ForbiddenPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const mainPage = RoutePath.MAIN();

    return (
        <VStack
            max
            justify="center"
            align='center'
            fullHeight
        >
            <Typography.Title level={1}>{t('403')}</Typography.Title>
            <MyTypography.Base>
                {t('У вас нет доступа к этой странице')}
            </MyTypography.Base>
            <Button
                onClick={() => navigate(mainPage)}
            >
                {t('На главную')}
            </Button>
        </VStack>
    );
};

export default ForbiddenPage;
 