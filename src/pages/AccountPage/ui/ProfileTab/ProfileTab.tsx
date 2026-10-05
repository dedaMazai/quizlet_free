import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ROLE_NAMES, useLogoutMutation, useUserInfo } from '@/entities/User';
import { ProfileForm } from '@/features/EditProfile';
import { AiQuotaCard } from '@/widgets/AiQuotaCard';
import { Blueprint } from '@/shared/ui/Blueprint';
import cls from './ProfileTab.module.scss';

/** «12 марта 2026» — без «г.», который добавляет Intl для ru */
const formatJoinDate = (date: string, language: string): string => {
    const parts = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', year: 'numeric' })
        .formatToParts(new Date(date));
    const yearIndex = parts.findIndex((p) => p.type === 'year');
    return parts.slice(0, yearIndex + 1).map((p) => p.value).join('');
};

/** Профиль 6.24: форма слева; квота ИИ и роль / дата / выход справа */
export const ProfileTab = memo(() => {
    const { t, i18n } = useTranslation();
    const user = useUserInfo();
    const [logout] = useLogoutMutation();

    return (
        <div className={cls.ProfileTab}>
            <ProfileForm />

            <div className={cls.aside}>
                <AiQuotaCard />
                <Blueprint className={cls.info}>
                    <div className={cls.infoRow}>
                        <span className={cls.infoLabel}>{t('Роль')}</span>
                        <span>{user?.role?.name ? t(ROLE_NAMES[user.role.name]) : '—'}</span>
                    </div>
                    <div className={cls.infoRow}>
                        <span className={cls.infoLabel}>{t('С нами с')}</span>
                        <span>{user?.created_at ? formatJoinDate(user.created_at, i18n.language) : '—'}</span>
                    </div>
                    <div className={cls.infoRow}>
                        <span className={cls.infoLabel}>{t('Сессия')}</span>
                        <Button type="link" className={cls.logout} onClick={() => logout()}>
                            {t('Выйти из аккаунта')}
                        </Button>
                    </div>
                </Blueprint>
            </div>
        </div>
    );
});

ProfileTab.displayName = 'ProfileTab';
