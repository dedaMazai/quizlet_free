import { useTranslation } from 'react-i18next';
import { Card } from 'antd';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { ThemeSwitcher } from '@/features/ThemeSwitcher';
import { LangSwitcher } from '@/features/LangSwitcher';

const SettingPage = () => {
    const { t } = useTranslation();

    return (
        <VStack max fullHeight gap="16">
            <MyTypography.Large strong>{t('Настройки')}</MyTypography.Large>
            <Card style={{ width: '100%', maxWidth: 480 }} variant="borderless">
                <VStack max gap="16">
                    <HStack max justify="between" align="center">
                        <MyTypography.Base>{t('Тема')}</MyTypography.Base>
                        <ThemeSwitcher />
                    </HStack>
                    <HStack max justify="between" align="center">
                        <MyTypography.Base>{t('Язык')}</MyTypography.Base>
                        <LangSwitcher />
                    </HStack>
                </VStack>
            </Card>
        </VStack>
    );
};

export default SettingPage;
