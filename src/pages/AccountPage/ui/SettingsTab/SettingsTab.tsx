import { FC, memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeModeSegmented } from '@/features/ThemeSwitcher';
import { LangSegmented } from '@/features/LangSwitcher';
import { VoiceSwitcher } from '@/features/VoiceSwitcher';
import { DailyGoalSwitcher } from '@/features/DailyGoalSwitcher';
import { DeleteAccountButton } from '@/features/DeleteAccount';
import { useDailyGoal } from '@/entities/UserSettings';
import { useGetTelegramLinkQuery } from '@/entities/User';
import { estimateReviewMinutes } from '@/shared/const/const';
import { SectionHeader, SectionHeaderSize } from '@/shared/ui/SectionHeader';
import cls from './SettingsTab.module.scss';

interface SettingRowProps {
    label: string;
    description: string;
    control: ReactNode;
}

const SettingRow: FC<SettingRowProps> = ({ label, description, control }) => (
    <div className={cls.row}>
        <div className={cls.rowText}>
            <span className={cls.rowLabel}>{label}</span>
            <span className={cls.rowDescription}>{description}</span>
        </div>
        <div className={cls.control}>{control}</div>
    </div>
);

interface SettingSectionProps {
    title: string;
    children: ReactNode;
}

const SettingSection: FC<SettingSectionProps> = ({ title, children }) => (
    <section className={cls.section}>
        <SectionHeader className={cls.sectionHeader} size={SectionHeaderSize.SM} title={title} />
        {children}
    </section>
);

/** Настройки 6.25: разделы с H2 и строками «подпись + сегменты» */
export const SettingsTab = memo(() => {
    const { t } = useTranslation();
    const goal = useDailyGoal();
    const { data: telegramLink } = useGetTelegramLinkQuery();

    return (
        <div className={cls.SettingsTab}>
            <SettingSection title={t('Оформление')}>
                <SettingRow
                    label={t('Тема')}
                    description={t('Светлая или тёмная')}
                    control={<ThemeModeSegmented />}
                />
                <SettingRow
                    label={t('Язык интерфейса')}
                    description={t('Слова и переводы не меняются')}
                    control={<LangSegmented />}
                />
            </SettingSection>

            {/* Нет в макете: цель дня негде больше поменять */}
            <SettingSection title={t('Занятия')}>
                <SettingRow
                    label={t('Цель дня')}
                    description={t('Карточек в день · ≈ {{count}} минут', { count: estimateReviewMinutes(goal) })}
                    control={<DailyGoalSwitcher />}
                />
            </SettingSection>

            <SettingSection title={t('Озвучивание')}>
                <SettingRow
                    label={t('Голос')}
                    description={t('Для произношения слов и примеров')}
                    control={<VoiceSwitcher />}
                />
            </SettingSection>

            <SettingSection title={t('Telegram')}>
                <SettingRow
                    label={telegramLink ? t('Привязан') : t('Не привязан')}
                    description={telegramLink
                        ? t('Из Telegram-бота вход без пароля')
                        : t('Откройте Zubrika в Telegram-боте и войдите — аккаунт привяжется')}
                    control={telegramLink?.username && (
                        <span className={cls.rowLabel}>@{telegramLink.username}</span>
                    )}
                />
            </SettingSection>

            <SettingSection title={t('Аккаунт и данные')}>
                <SettingRow
                    label={t('Удаление аккаунта')}
                    description={t('Удаляет аккаунт и все данные без возможности восстановления — это и есть отзыв согласия на обработку')}
                    control={<DeleteAccountButton />}
                />
            </SettingSection>
        </div>
    );
});

SettingsTab.displayName = 'SettingsTab';
