import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';

interface ErrorFallbackProps {}

export const ErrorFallback: FC<ErrorFallbackProps> = () => {
    const { t } = useTranslation();

    const handleReloadPage = () => {
        window.location.reload();
    };

    return (
        <VStack gap="12" align="center" justify="center">
            <MyTypography.Base strong style={{ textAlign: 'center', maxWidth: '600px' }}>
                {t('Обновлен компонент! Необходимо обновить страницу')}
            </MyTypography.Base>
            <Button
                icon={<ReloadOutlined />}
                onClick={handleReloadPage}
            >
                {t('Обновить страницу')}
            </Button>
        </VStack>
    );
};
