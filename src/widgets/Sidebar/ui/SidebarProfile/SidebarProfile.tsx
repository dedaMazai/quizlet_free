import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Dropdown, MenuProps } from 'antd';
import { ChevronDown } from 'lucide-react';
import {
    checkRequireAccesses,
    useLogoutMutation,
    useUserAccesses,
    useUserInfo,
} from '@/entities/User';
import { classNames } from '@/shared/lib/classNames/classNames';
import { getSettingsUsersPath, RoutePath } from '@/shared/config/router/routePath';
import { getAvatarSrc } from '@/shared/const/avatars';
import { Accesses } from '@/shared/types/accesses';
import cls from './SidebarProfile.module.scss';

enum ProfileMenuKey {
    PROFILE = 'profile',
    SETTINGS = 'settings',
    USERS = 'users',
    LOGOUT = 'logout',
}

interface SidebarProfileProps {
    collapsed?: boolean;
}

/** Блок профиля внизу сайдбара: аватар, имя и меню аккаунта */
export const SidebarProfile = memo(({ collapsed }: SidebarProfileProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userInfo = useUserInfo();
    const userAccesses = useUserAccesses();
    const [logout] = useLogoutMutation();

    const canReadUsers = useMemo(
        () => checkRequireAccesses({ accesses: [Accesses.users_can_read], userAccesses }),
        [userAccesses],
    );

    const items = useMemo<MenuProps['items']>(() => [
        { key: ProfileMenuKey.PROFILE, label: t('Профиль') },
        { key: ProfileMenuKey.SETTINGS, label: t('Настройки') },
        ...(canReadUsers ? [{ key: ProfileMenuKey.USERS, label: t('Пользователи') }] : []),
        { type: 'divider' as const },
        { key: ProfileMenuKey.LOGOUT, label: t('Выйти'), danger: true },
    ], [t, canReadUsers]);

    const handleClick = useCallback(({ key }: { key: string }) => {
        switch (key) {
        case ProfileMenuKey.PROFILE:
            navigate(RoutePath.PROFILE());
            break;
        case ProfileMenuKey.SETTINGS:
            navigate(RoutePath.SETTINGS());
            break;
        case ProfileMenuKey.USERS:
            navigate(getSettingsUsersPath());
            break;
        case ProfileMenuKey.LOGOUT:
            logout();
            break;
        default:
        }
    }, [navigate, logout]);

    if (!userInfo) {
        return null;
    }

    const avatarSrc = getAvatarSrc(userInfo.avatar);
    const initials = `${userInfo.name?.[0] ?? ''}${userInfo.surname?.[0] ?? ''}`.toUpperCase();
    const shortName = userInfo.surname
        ? `${userInfo.name} ${userInfo.surname[0]}.`
        : userInfo.name || userInfo.email;

    return (
        <Dropdown
            menu={{ items, onClick: handleClick }}
            trigger={['click']}
            placement={collapsed ? 'topLeft' : 'top'}
        >
            <button
                type="button"
                aria-label={t('Аккаунт')}
                className={classNames(cls.SidebarProfile, [], { [cls.collapsed]: collapsed })}
            >
                <span className={cls.avatar}>
                    {avatarSrc ? <img src={avatarSrc} alt="" className={cls.avatarImg} /> : initials}
                </span>
                {!collapsed && (
                    <>
                        <span className={cls.info}>
                            <span className={cls.name}>{shortName}</span>
                            <span className={cls.hint}>{t('Настройки, тема, язык')}</span>
                        </span>
                        <ChevronDown size={16} strokeWidth={1.5} />
                    </>
                )}
            </button>
        </Dropdown>
    );
});

SidebarProfile.displayName = 'SidebarProfile';
