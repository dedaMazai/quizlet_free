import { useTranslation } from 'react-i18next';
import { memo, useCallback, useMemo, useState } from 'react';
import {
    Avatar,
    Button,
    Menu,
} from 'antd';
import {
    useLocation,
    useNavigate,
} from 'react-router';
import Icon, {
    UserOutlined,
} from '@ant-design/icons';
import { classNames } from '@/shared/lib/classNames/classNames';
import { LangSwitcher } from '@/features/LangSwitcher';
import { ThemeSwitcher } from '@/features/ThemeSwitcher';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useUserInfo } from '@/entities/User';
import { LogoutButton } from '@/features/Logout';
import { ReactComponent as MenuOutlined } from '@/shared/assets/icons/MenuOutlined.svg';
import { Drawer } from '@/shared/ui/Drawer';
import { getActiveSection, getMenuItems, getNavSections } from '@/shared/const/menu';
import { buildName } from '@/shared/lib/helpers/buildName';
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

    const userInfo = useUserInfo();

    const items = useMemo(() => getMenuItems({ t }), [t]);

    const activePath = useMemo(
        () => getActiveSection(location.pathname, getNavSections({ t }))?.path,
        [location.pathname, t],
    );

    const handleClickItem = useCallback(({ key }: { key: string }) => {
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
                            onClick={() => {
                                navigate(RoutePath.PROFILE());
                                setOpenMenu(false);
                            }}
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
                        selectedKeys={activePath ? [activePath] : []}
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
    const userInfo = useUserInfo();

    return (
        <header className={classNames(cls.Navbar, {}, [className])}>
            <HStack gap="12" max justify='end'>
                {userInfo ? <NavbarMenu /> : (
                    <HStack gap="12">
                        <ThemeSwitcher />
                        <LangSwitcher />
                    </HStack>
                )}
            </HStack>
        </header>
    );
});
