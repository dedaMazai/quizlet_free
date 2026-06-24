import { FC, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { Card, Tabs, Typography } from 'antd';
import { classNames } from '@/shared/lib/classNames/classNames';
import {
    BgColorsOutlined,
    GlobalOutlined,
    SoundOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { ThemeSwitcher } from '@/features/ThemeSwitcher';
import { LangSwitcher } from '@/features/LangSwitcher';
import { VoiceSwitcher } from '@/features/VoiceSwitcher';
import { useUserAccesses, checkRequireAccesses } from '@/entities/User';
import { Accesses } from '@/shared/types/accesses';
import { UsersTable } from '@/widgets/UsersTable';
import cls from './SettingPage.module.scss';

interface SettingRowProps {
    icon: ReactNode;
    label: string;
    description: string;
    control: ReactNode;
    /** На узких экранах переносит контрол под текст (для широких контролов, например селекта). */
    stackOnMobile?: boolean;
}

const SettingRow: FC<SettingRowProps> = (props) => {
    const {
        icon, label, description, control, stackOnMobile,
    } = props;

    return (
        <div className={classNames(cls.row, { [cls.rowStack]: stackOnMobile })}>
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
    const [searchParams, setSearchParams] = useSearchParams();
    const userAccesses = useUserAccesses();

    const canManageUsers = useMemo(
        () => checkRequireAccesses({ accesses: [Accesses.users_can_read], userAccesses }),
        [userAccesses],
    );

    const preferences = (
        <VStack max gap="24">
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
                        stackOnMobile
                    />
                </VStack>
            </Card>
        </VStack>
    );

    const tabItems = [
        {
            key: 'Settings',
            label: t('Настройки'),
            children: preferences,
        },
        ...(canManageUsers ? [{
            key: 'Users',
            label: (
                <span><TeamOutlined /> {t('Пользователи')}</span>
            ),
            children: <UsersTable />,
        }] : []),
    ];

    const activeKey = searchParams.get('activeTab') === 'Users' && canManageUsers
        ? 'Users'
        : 'Settings';

    const handleTabChange = (key: string) => {
        if (key === 'Settings') {
            searchParams.delete('activeTab');
        } else {
            searchParams.set('activeTab', key);
        }
        setSearchParams(searchParams);
    };

    return (
        <VStack max fullHeight gap="24">
            <VStack gap="4">
                <Typography.Title level={2}>{t('Настройки')}</Typography.Title>
                <Typography.Paragraph type="secondary">
                    {t('Персонализация приложения')}
                </Typography.Paragraph>
            </VStack>

            <Tabs activeKey={activeKey} onChange={handleTabChange} items={tabItems} />
        </VStack>
    );
};

export default SettingPage;
