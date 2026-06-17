import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography } from 'antd';
import {
    BgColorsOutlined,
    GlobalOutlined,
    SoundOutlined,
} from '@ant-design/icons';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { ThemeSwitcher } from '@/features/ThemeSwitcher';
import { LangSwitcher } from '@/features/LangSwitcher';
import { VoiceSwitcher } from '@/features/VoiceSwitcher';
import cls from './SettingPage.module.scss';

interface SettingRowProps {
    icon: ReactNode;
    label: string;
    description: string;
    control: ReactNode;
}

const SettingRow: FC<SettingRowProps> = (props) => {
    const {
        icon, label, description, control,
    } = props;

    return (
        <div className={cls.row}>
            <div className={cls.rowMain}>
                <div className={cls.iconBox}>{icon}</div>
                <div className={cls.rowText}>
                    <MyTypography.Base strong className={cls.rowLabel}>{label}</MyTypography.Base>
                    <MyTypography.Small type="secondary">{description}</MyTypography.Small>
                </div>
            </div>
            <div className={cls.control}>{control}</div>
        </div>
    );
};

const SettingPage = () => {
    const { t } = useTranslation();

    return (
        <VStack max fullHeight gap="24">
            <VStack gap="4">
                <Typography.Title level={2}>{t('Настройки')}</Typography.Title>
                <Typography.Paragraph type="secondary">
                    {t('Персонализация приложения')}
                </Typography.Paragraph>
            </VStack>

            <Card className={cls.card} variant="borderless">
                <VStack max>
                    <div className={cls.sectionTitle}>{t('Оформление')}</div>
                    <SettingRow
                        icon={<BgColorsOutlined />}
                        label={t('Тема')}
                        description={t('Светлая или тёмная')}
                        control={<ThemeSwitcher />}
                    />
                    <div className={cls.divider} />
                    <SettingRow
                        icon={<GlobalOutlined />}
                        label={t('Язык')}
                        description={t('Язык интерфейса')}
                        control={<LangSwitcher />}
                    />
                </VStack>
            </Card>

            <Card className={cls.card} variant="borderless">
                <VStack max>
                    <div className={cls.sectionTitle}>{t('Озвучивание')}</div>
                    <SettingRow
                        icon={<SoundOutlined />}
                        label={t('Голос')}
                        description={t('Голос для произношения слов')}
                        control={<VoiceSwitcher />}
                    />
                </VStack>
            </Card>
        </VStack>
    );
};

export default SettingPage;
