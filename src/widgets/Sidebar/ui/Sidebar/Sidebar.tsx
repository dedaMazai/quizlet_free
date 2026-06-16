import {
    memo,
    useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { HomeOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import { BrowserView } from 'react-device-detect';
import { classNames } from '@/shared/lib/classNames/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { useResizable } from '@/shared/lib/hooks/useResizable';
import { ReactComponent as LeftArrow } from '@/shared/assets/icons/Sidebar/LeftArrow.svg';
import { ReactComponent as LogoPioneer } from '@/shared/assets/icons/LogoPioneer.svg';
import { ReactComponent as LogoPioneerBig } from '@/shared/assets/icons/LogoBigPioneer.svg';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './Sidebar.module.scss';

export const Sidebar = memo(() => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useLocalStorage('CollapsedSidebar', false);
    const [sidebarWidth, setSidebarWidth] = useLocalStorage('SidebarWidth', 300);
    const { width, isDragging, handleMouseDown } = useResizable({
        initialWidth: sidebarWidth,
        minWidth: 300,
        maxWidth: 600,
        enabled: !collapsed,
        onResizeEnd: setSidebarWidth,
    });

    const handleNavigate = useCallback((path: string) => {
        navigate(path);
    }, [navigate]);

    const handleLogoClick = useCallback(() => {
        navigate(RoutePath.MAIN());
    }, [navigate]);

    return (
        <BrowserView>
            <div style={{ position: 'relative' }}>
                <div
                    className={classNames(
                        cls.Sidebar,
                        !collapsed && cls.open,
                        isDragging && cls.dragging,
                    )}
                    style={!collapsed ? { width } : undefined}
                >
                    {/* Header with logo and collapse button */}
                    <HStack
                        justify="between"
                        max
                        className={cls.headerSidebar}
                        style={{
                            paddingLeft: collapsed ? '10px' : '22px',
                        }}
                    >
                        <div
                            onClick={handleLogoClick}
                            style={{ cursor: 'pointer' }}
                        >
                            {collapsed
                                ? <LogoPioneer width={40} height={26} style={{ color: 'var(--color-logo)' }} />
                                : <LogoPioneerBig width={104} height={28} />
                            }
                        </div>
                        <Button
                            className={cls.collapseBtn}
                            color="default"
                            variant="text"
                            icon={
                                <LeftArrow
                                    style={{
                                        transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease',
                                    }}
                                />
                            }
                            onClick={() => setCollapsed((prev) => !prev)}
                            style={{
                                width: collapsed ? '24px' : '50px',
                            }}
                        />
                    </HStack>

                    {/* Navigation modules */}
                    <div className={cls.modulesContainer}>
                        <div
                            className={classNames(cls.moduleHeader, {
                                [cls.moduleHeaderActive]: location.pathname === RoutePath.MAIN(),
                            })}
                            onClick={() => handleNavigate(RoutePath.MAIN())}
                        >
                            <HStack align="center" gap="8" max>
                                <span className={cls.moduleIcon}><HomeOutlined /></span>
                                {!collapsed && (
                                    <MyTypography.Base className={cls.moduleLabel}>
                                        {t('Главная')}
                                    </MyTypography.Base>
                                )}
                            </HStack>
                        </div>
                    </div>

                    {/* Bottom section */}
                    <VStack className={cls.bottomSection} gap="4">
                        {!collapsed && (
                            <MyTypography.Small
                                type="secondary"
                                style={{ position: 'absolute', bottom: 0, left: 0 }}
                            >
                                {__APP_VERSION__}
                            </MyTypography.Small>
                        )}
                    </VStack>

                    {!collapsed && (
                        <div
                            className={classNames(
                                cls.resizeHandle,
                                isDragging && cls.resizeHandleDragging,
                            )}
                            onMouseDown={handleMouseDown}
                        />
                    )}
                </div>
            </div>
        </BrowserView>
    );
});
