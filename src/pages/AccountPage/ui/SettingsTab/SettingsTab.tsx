import { FC, memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'antd';
import { classNames } from '@/shared/lib/classNames/classNames';
import {
    AimOutlined,
    BgColorsOutlined,
    GlobalOutlined,
    SoundOutlined,
} from '@ant-design/icons';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { ThemeSwitcher } from '@/features/ThemeSwitcher';
import { LangSwitcher } from '@/features/LangSwitcher';
import { VoiceSwitcher } from '@/features/VoiceSwitcher';
import { DailyGoalSwitcher } from '@/features/DailyGoalSwitcher';
import { useDailyGoal } from '@/entities/UserSettings';
import { estimateReviewMinutes } from '@/shared/const/const';
import cls from './SettingsTab.module.scss';

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

export const SettingsTab = memo(() => {
    const { t } = useTranslation();
    const goal = useDailyGoal();

    return (
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
                    <div className={cls.sectionTitle}>{t('Занятия')}</div>
                    <SettingRow
                        icon={<AimOutlined />}
                        label={t('Цель дня')}
                        description={t('Карточек в день · ≈ {{count}} минут', { count: estimateReviewMinutes(goal) })}
                        control={<DailyGoalSwitcher />}
                        stackOnMobile
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
});

SettingsTab.displayName = 'SettingsTab';
