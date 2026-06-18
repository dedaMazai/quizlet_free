import { useTranslation } from 'react-i18next';
import { memo, useCallback, useMemo, useState } from 'react';
import {
    Avatar,
    Button,
    Dropdown,
    Menu,
} from 'antd';
import {
    useLocation,
    useMatches,
    useNavigate,
} from 'react-router';
import { BrowserView, MobileView } from 'react-device-detect';
import Icon, {
    UserOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { classNames } from '@/shared/lib/classNames/classNames';
import { LangSwitcher } from '@/features/LangSwitcher';
import { ThemeSwitcher } from '@/features/ThemeSwitcher';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useLogoutMutation, useUserAccesses, useUserInfo } from '@/entities/User';
import { LogoutButton } from '@/features/Logout';
import { BreadcrumbsCustom, Crumb } from './BreadcrumbsCustom';
import { ReactComponent as MenuOutlined } from '@/shared/assets/icons/MenuOutlined.svg';
import { ReactComponent as Exit } from '@/shared/assets/icons/Sidebar/Exit.svg';
import { Drawer } from '@/shared/ui/Drawer';
import { getMenuItems } from '@/shared/const/menu';
import { buildName } from '@/shared/lib/helpers/buildName';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';
import { UserNotification } from '@/entities/Notifications/ui/UserNotification';
import cls from './Navbar.module.scss';

interface NavbarProps {
    className?: string;
}

export const NavbarMenu = memo(() => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [open, setOpen] = useState<string>();
    const userAccesses = useUserAccesses();

    const userInfo = useUserInfo();

    const items = useMemo(() => getMenuItems({ userAccesses, t  }), [t, userAccesses])

    const openRoute = useMemo(() => `/${location.pathname.split('/')[1]}`, [location.pathname]);

    const handleClickItem = useCallback(({ key }: { key: string }) => {
        setOpen(key);
        navigate(key);
        setOpenMenu(false)
    }, [navigate]);

    const userPhoto = userInfo?.avatar_file?.url;

    return (
        <>
            <Button
                onClick={() => setOpenMenu(true)}
                color="default"
                variant="filled"
                icon={<Icon component={MenuOutlined} />}
            />
            <Drawer isOpen={openMenu} onClose={() => setOpenMenu(false)}>
                <VStack
                    max
                    gap="12"
                    className={cls.menuWrap}
                >
                    <HStack max gap="12" align="center">
                        <HStack
                            max
                            gap="10"
                            className={cls.profileCard}
                        >
                            {userPhoto ? (
                                <img
                                    width={32}
                                    height={32}
                                    style={{
                                        borderRadius: 6,
                                        objectFit: 'cover',
                                    }}
                                    src={userPhoto}
                                    alt=""
                                />
                            ) : (
                                <Avatar
                                    style={{ flexShrink: 0 }}
                                    shape="square"
                                    size={32}
                                    icon={<UserOutlined />}
                                />
                            )}
                            {userInfo && (
                                <VStack max>
                                    <MyTypography.Base
                                        ellipsis
                                    >
                                        {buildName({
                                            surname: userInfo.surname,
                                            name: userInfo.name,
                                            middle_name: userInfo.middle_name,
                                            language: userInfo.language,
                                        })}
                                    </MyTypography.Base>
                                    <MyTypography.Base
                                        type="secondary"
                                        ellipsis
                                    >
                                        {userInfo.role?.name}
                                    </MyTypography.Base>
                                </VStack>
                            )}
                        </HStack>
                        <UserNotification />
                        <ThemeSwitcher />
                        <LangSwitcher size="large" />
                    </HStack>
                    <Menu
                        className={cls.menu}
                        onClick={handleClickItem}
                        selectedKeys={[open || openRoute]}
                        mode="vertical"
                        items={items}
                        style={{
                            borderRadius: 8,
                            width: '100%',
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                        }}
                    />
                    <LogoutButton variant="navbar" />
                </VStack>
            </Drawer>
        </>
    )
});

export const Navbar = memo(({ className }: NavbarProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userInfo = useUserInfo();
    const matches = useMatches();
    const { isMobile } = useMatchMedia();
    const [logout] = useLogoutMutation();

    const withCrumbs = !!matches.filter((match) =>
        // @ts-ignore — handle.crumbs is custom route property not in UIMatch type
        Boolean(match.handle?.crumbs),
    ).length;
    const breadcrumbs: Crumb[] = matches
        // @ts-ignore — handle.crumbs is custom route property not in UIMatch type
        .filter((match) => Boolean(match.handle?.crumbs))
        // @ts-ignore — handle.crumbs is custom route property not in UIMatch type
        .map((match) => match.handle.crumbs?.(match.params))[0] || [{ path: '/' }];

    const showBreadcrumbs = withCrumbs && !isMobile && userInfo;

    const userPhoto = userInfo?.avatar_file?.url;

    const userMenuItems = useMemo(() => [
        {
            key: 'username',
            label: userInfo?.email,
            disabled: true,
        },
        {
            key: 'settings',
            label: t('Настройки'),
            icon: <Icon component={SettingOutlined} />,
        },
        { type: 'divider' as const },
        {
            key: 'logout',
            label: t('Выйти'),
            icon: <Icon component={Exit} />,
            danger: true,
        },
    ], [userInfo?.email, t]);

    const handleUserMenuClick = useCallback(({ key }: { key: string }) => {
        if (key === 'logout') {
            logout();
        }
        if (key === 'settings') {
            navigate(RoutePath.SETTINGS());
        }
    }, [logout, navigate]);

    return (
        <header className={classNames(cls.Navbar, {}, [className])}>
            {showBreadcrumbs && (
                <BreadcrumbsCustom breadcrumbs={breadcrumbs}/>
            )}
            <HStack gap="12" max justify='end'>
                <BrowserView>
                    <HStack gap="12" align="center">
                        <ThemeSwitcher />
                        <LangSwitcher />
                        {userInfo && (
                            <>
                                <UserNotification />
                                <Dropdown
                                    menu={{
                                        items: userMenuItems,
                                        onClick: handleUserMenuClick,
                                    }}
                                    trigger={['click']}
                                    placement="bottomRight"
                                    rootClassName={cls.rootClassName}
                                >
                                    <div className={cls.dropDown}>
                                        {userPhoto ? (
                                            <Avatar
                                                size={32}
                                                src={userPhoto}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        ) : (
                                            <Avatar
                                                size={32}
                                                icon={<UserOutlined />}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        )}
                                    </div>
                                </Dropdown>
                            </>
                        )}
                    </HStack>
                </BrowserView>
                <MobileView>
                    {userInfo ? <NavbarMenu /> : (
                        <HStack gap="12">
                            <ThemeSwitcher />
                            <LangSwitcher />
                        </HStack>
                    )}
                </MobileView>
            </HStack>
        </header>
    );
});
