import {
    Fragment,
    memo,
    useCallback,
    useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import { BrowserView, isBrowser } from 'react-device-detect';
import { classNames } from '@/shared/lib/classNames/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { useResizable } from '@/shared/lib/hooks/useResizable';
import { ReactComponent as LeftArrow } from '@/shared/assets/icons/Sidebar/LeftArrow.svg';
import { ReactComponent as LogoFlashcards } from '@/shared/assets/icons/LogoFlashcards.svg';
import { ReactComponent as LogoFlashcardsBig } from '@/shared/assets/icons/LogoBigFlashcards.svg';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';
import { getNavSections, isNavItemActive } from '@/shared/const/menu';
import { useUserAccesses } from '@/entities/User';
import { useGetDecksQuery } from '@/entities/Deck';
import { useGetDueCountQuery } from '@/entities/Card';
import cls from './Sidebar.module.scss';

const RECENT_DECKS_COUNT = 5;

export const Sidebar = memo(() => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const userAccesses = useUserAccesses();

    const [collapsed, setCollapsed] = useLocalStorage('CollapsedSidebar', false);
    const [sidebarWidth, setSidebarWidth] = useLocalStorage('SidebarWidth', 300);
    const { width, isDragging, handleMouseDown } = useResizable({
        initialWidth: sidebarWidth,
        minWidth: 300,
        maxWidth: 600,
        enabled: !collapsed,
        onResizeEnd: setSidebarWidth,
    });

    const sections = useMemo(
        () => getNavSections({ t, userAccesses }),
        [t, userAccesses],
    );

    // Тело компонента исполняется и на мобиле (BrowserView стоит внутри return),
    // поэтому запрос пропускается и там, и в свёрнутом состоянии.
    // selectFromResult отдаёт сам data: новый массив на каждый вызов ломал бы
    // шэллоу-сравнение RTK Query и приводил к лишним рендерам.
    const { decks } = useGetDecksQuery(undefined, {
        skip: collapsed || !isBrowser,
        selectFromResult: ({ data }) => ({ decks: data }),
    });

    const recentDecks = useMemo(
        () => [...(decks ?? [])]
            .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
            .slice(0, RECENT_DECKS_COUNT),
        [decks],
    );

    // Бейдж долга: счётчик тянет потребитель, а не конфиг навигации —
    // getNavSections обязан остаться чистой функцией от t и доступов.
    const { data: due } = useGetDueCountQuery(undefined, { skip: !isBrowser });

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
                                ? <LogoFlashcards width={40} height={26} style={{ color: 'var(--color-logo)' }} />
                                : <LogoFlashcardsBig width={104} height={28} />
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
                        {sections.map((section) => (
                            <Fragment key={section.key}>
                                {section.label && !collapsed && (
                                    <MyTypography.Small
                                        type="secondary"
                                        className={cls.sectionTitle}
                                    >
                                        {section.label}
                                    </MyTypography.Small>
                                )}
                                {section.items.map((item) => (
                                    <div
                                        key={item.key}
                                        className={classNames(cls.moduleHeader, {
                                            [cls.moduleHeaderActive]: isNavItemActive(
                                                location.pathname,
                                                item,
                                            ),
                                        })}
                                        onClick={() => handleNavigate(item.key)}
                                    >
                                        <HStack align="center" gap="8" max>
                                            <span className={cls.moduleIcon}>{item.icon}</span>
                                            {!collapsed && (
                                                <MyTypography.Base className={cls.moduleLabel}>
                                                    {item.label}
                                                </MyTypography.Base>
                                            )}
                                            {item.key === RoutePath.REVIEW() && !!due?.count && (
                                                collapsed
                                                    ? <Badge dot />
                                                    : <Badge count={due.count} overflowCount={99} />
                                            )}
                                        </HStack>
                                    </div>
                                ))}
                            </Fragment>
                        ))}

                        {!collapsed && recentDecks.length > 0 && (
                            <div className={cls.recentSection}>
                                <MyTypography.Small
                                    type="secondary"
                                    className={cls.sectionTitle}
                                >
                                    {t('Недавние колоды')}
                                </MyTypography.Small>
                                {recentDecks.map((deck) => (
                                    <div
                                        key={deck.uuid}
                                        className={classNames(cls.moduleItem, {
                                            [cls.moduleItemActive]:
                                                location.pathname === RoutePath.DECK(deck.uuid),
                                        })}
                                        onClick={() => handleNavigate(RoutePath.DECK(deck.uuid))}
                                    >
                                        <MyTypography.Base className={cls.itemLabel}>
                                            {deck.name}
                                        </MyTypography.Base>
                                    </div>
                                ))}
                            </div>
                        )}
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
