import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { checkRequireAccesses, useUserAccesses } from '@/entities/User';
import { UsersTable } from '@/widgets/UsersTable';
import {
    getSettingsUsersPath,
    RoutePath,
    SETTINGS_TAB_PARAM,
    SETTINGS_USERS_TAB,
} from '@/shared/config/router/routePath';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { Accesses } from '@/shared/types/accesses';
import { PageHeader } from '@/shared/ui/PageHeader';
import { SectionTabItem } from '@/shared/ui/SectionTabs';
import { VStack } from '@/shared/ui/Stack';
import { AccountTab } from '../model/accountTab';
import { MobileAccount } from './MobileAccount/MobileAccount';
import { ProfileTab } from './ProfileTab/ProfileTab';
import { SettingsTab } from './SettingsTab/SettingsTab';
import cls from './AccountPage.module.scss';

interface AccountPageProps {
    tab: AccountTab.PROFILE | AccountTab.SETTINGS;
}

/** Аккаунт: Профиль · Настройки · Пользователи (6.24–6.26). Вкладки — маршруты PROFILE и SETTINGS. */
const AccountPage = ({ tab }: AccountPageProps) => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const userAccesses = useUserAccesses();
    const { isMobile } = useMatchMedia();

    const canReadUsers = useMemo(
        () => checkRequireAccesses({ accesses: [Accesses.users_can_read], userAccesses }),
        [userAccesses],
    );

    const activeTab = tab === AccountTab.SETTINGS && canReadUsers && searchParams.get(SETTINGS_TAB_PARAM) === SETTINGS_USERS_TAB
        ? AccountTab.USERS
        : tab;

    const tabs = useMemo<SectionTabItem[]>(() => [
        {
            to: RoutePath.PROFILE(),
            label: t('Профиль'),
            active: activeTab === AccountTab.PROFILE,
        },
        {
            to: RoutePath.SETTINGS(),
            label: t('Настройки'),
            active: activeTab === AccountTab.SETTINGS,
        },
        ...(canReadUsers ? [{
            to: getSettingsUsersPath(),
            label: (
                <>
                    {t('Пользователи')}
                    <span className={cls.adminMark}>ADMIN</span>
                </>
            ),
            active: activeTab === AccountTab.USERS,
        }] : []),
    ], [t, activeTab, canReadUsers]);

    // Мобильная (6.56): один экран без вкладок, «Пользователи» скрыты
    if (isMobile) {
        return <MobileAccount />;
    }

    return (
        <VStack max gap="24">
            <PageHeader title={t('Аккаунт')} tabs={tabs} />
            {activeTab === AccountTab.PROFILE && <ProfileTab />}
            {activeTab === AccountTab.SETTINGS && <SettingsTab />}
            {activeTab === AccountTab.USERS && <UsersTable />}
        </VStack>
    );
};

export default AccountPage;
