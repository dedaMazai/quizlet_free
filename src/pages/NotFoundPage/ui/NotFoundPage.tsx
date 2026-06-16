import { useTranslation } from 'react-i18next';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { VStack } from '@/shared/ui/Stack';
import { RoutePath } from '@/shared/config/router/routePath';
import { MyTypography } from '@/shared/ui/MyTypography';

interface NotFoundPageProps {
    className?: string;
}

export const NotFoundPage = ({ className }: NotFoundPageProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const mainPage = RoutePath.MAIN();

    return (
        <VStack
            max
            justify="center"
            align='center'
            fullHeight
            className={className}
        >
            <Typography.Title level={1}>{t('404')}</Typography.Title>
            <MyTypography.Base>
                {t('Страница по данному адресу не найдена')}
            </MyTypography.Base>
            <MyTypography.Base type="secondary">
                {t('Возможно, ссылка устарела или страница более недоступна.')}
            </MyTypography.Base>
            <Button
                onClick={() => navigate(mainPage)}
            >
                {t('На главную')}
            </Button>
        </VStack>
    );
}; 
