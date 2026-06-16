import { useTranslation } from 'react-i18next';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
    Button,
    Popover,
    Tabs,
    Tooltip,
    Typography,
} from 'antd';
import Icon, {
    CloseOutlined,
    NotificationOutlined,
} from '@ant-design/icons';
import { BrowserView, isMobile, MobileView } from 'react-device-detect';
import { useNavigate } from 'react-router-dom';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import {
    useDeleteNotificationsMutation,
    useGetNotificationsQuery,
    useMarkReadNotificationsMutation,
} from '../model/api/notificationsApi';
import { formatDateTime } from '@/shared/lib/formatters';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';
import { Drawer } from '@/shared/ui/Drawer';
import { useUserInfo } from '@/entities/User';
import { getNotificationLink } from '../model/lib/getNotificationLink';
import cls from './UserNotification.module.scss';

type TypeTab = 'all' | 'unread';

const CardNotification = memo(({
    uuid,
    text,
    created_at,
    isRead,
    onDelete,
    onRead,
    path,
}: {
    uuid: string
    text: string
    created_at: string
    path?: string
    isRead?: boolean
    onDelete: (value: {
        notification_uuids: string[];
    }) => void
    onRead: (value: string) => void
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <VStack
            max
            gap="4"
            className={cls.CardNotification}
            onMouseEnter={() => {
                if (!isRead) {
                    onRead(uuid)
                }
            }}
        >
            <HStack max gap="6" justify="between" align="start">
                <MyTypography.Base>
                    {text}
                </MyTypography.Base>
                <div style={{ width: 12, height: 12 }}>
                    <Button
                        icon={<Icon component={CloseOutlined} style={{ color: 'var(--color-icon-secondary)' }} />}
                        type="text"
                        className={cls.closeBtn}
                        size='small'
                        onClick={() => onDelete({
                            notification_uuids: [uuid],
                        })}
                    />
                    {!isRead && (
                        <div
                            className={cls.checker}
                        />
                    )}
                </div>
            </HStack>
            <HStack max gap="6" justify="between">
                <MyTypography.Base
                    type="secondary"
                >
                    {formatDateTime(created_at)}
                </MyTypography.Base>
                {path && (
                    <Button
                        type="text"
                        size='small'
                        className={cls.textBtn}
                        onClick={() => (
                            navigate(path)
                        )}
                    >
                        {t('Открыть')}
                    </Button>
                )}
            </HStack>
        </VStack>
    )
})

export const UserNotificationDefault = memo(() => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<TypeTab>('all');
    const [needRead, setNeedRead] = useState<string[]>([]);
    const userInfo = useUserInfo();

    const { data: notifications } = useGetNotificationsQuery(undefined, {
        skip: !userInfo?.uuid,
    });
    const [markReadNotifications] = useMarkReadNotificationsMutation();
    const [deleteNotifications] = useDeleteNotificationsMutation();

    const notificationIds = useMemo(() => {
        const all: string[] = [];
        const notRead: string[] = [];

        notifications?.objects.forEach(({ uuid, read_at }) => {
            if (!read_at) {
                notRead.push(uuid);
            }

            all.push(uuid);
        })

        return ({
            all,
            notRead,
        })
    }, [notifications?.objects])

    const addToNeedRead = useCallback((value: string) => {
        setNeedRead((prev) => [...prev, value])
    }, [])

    const debouncedRead = useDebounce((value: string[]) => {
        setNeedRead([]);
        markReadNotifications({
            notification_uuids: Array.from(new Set(value)),
        });
    });

    const onClose = useCallback(() => {
        setOpen(false);
    }, []);

    useEffect(() => {
        if (needRead.length) {
            debouncedRead(needRead);
        }
    }, [debouncedRead, needRead])

    const content = (
        (
            <VStack
                max
                fullHeight
                gap="12"
                style={{
                    padding: isMobile ? '0 12px' : 12,
                }}
            >
                <Tabs
                    activeKey={tab}
                    onChange={(value) => {
                        setTab(value as TypeTab);
                    }}
                    // className={cls.tabs}
                    tabBarStyle={{
                        marginBottom: 0,
                    }}
                    items={[
                        {
                            label: t('Все'),
                            key: 'all',
                        },
                        {
                            label: t('Непрочитанные'),
                            key: 'unread',
                        },
                    ]}
                />
                <HStack
                    max
                    justify="between"
                >
                    <Button
                        variant="text"
                        color="default"
                        size="small"
                        className={cls.textBtn}
                        // disabled={!notificationIds.notRead.length}
                        onClick={() => markReadNotifications({ notification_uuids: notificationIds.notRead })}
                    >
                        {t('Пометить все как прочитанное')}
                    </Button>
                    <Button
                        variant="text"
                        color="default"
                        size="small"
                        className={cls.textBtn}
                        // disabled={!notificationIds.all.length}
                        onClick={() => deleteNotifications({ notification_uuids: notificationIds.all })}
                    >
                        {t('Удалить все')}
                    </Button>
                </HStack>
                <VStack
                    max
                    className={cls.list}
                    style={{
                        height: isMobile ? 'calc(100vh - 240px)' : '282px',
                    }}
                >
                    {
                        notifications?.objects
                        .filter(({ read_at }) => {
                            if (tab === 'unread' && read_at) {
                                return false;
                            }

                            return true;
                        })
                        .map(({
                            created_at,
                            text,
                            uuid,
                            read_at,
                            entity,
                            entity_uuid,
                            extra,
                        }) => (
                            <CardNotification
                                key={uuid}
                                uuid={uuid}
                                text={text}
                                created_at={created_at}
                                isRead={!!read_at}
                                onDelete={deleteNotifications}
                                onRead={addToNeedRead}
                                path={getNotificationLink({ entity, entity_uuid, extra }) ?? undefined}
                            />
                        ))
                    }
                </VStack>
            </VStack>
        )
    )


    return (
        <div>
            <BrowserView>
                <Popover
                    open={open}
                    onOpenChange={(value: boolean) => setOpen(value)}
                    arrow={false}
                    placement="bottomRight"
                    styles={{
                        container: {
                            padding: 0,
                            borderRadius: 6,
                            overflow: 'hidden',
                        }
                    }}
                    trigger="click"
                    content={(
                        <VStack
                            max
                            fullHeight
                            style={{
                                width: 440,
                            }}
                        >
                            <HStack
                                max
                                gap="10"
                                justify="between"
                                className={cls.header}
                            >
                                <Typography.Title
                                    level={5}
                                    style={{
                                        color: 'var(--text)',
                                        margin: 0,
                                    }}
                                >
                                    {t('Уведомления')}
                                </Typography.Title>
                                <Button
                                    icon={<CloseOutlined style={{ color: 'var(--text)' }} />}
                                    type="text"
                                    onClick={onClose}
                                />
                            </HStack>
                            {content}
                        </VStack>
                    )}
                >
                    <Tooltip title={t('Уведомления')}>
                        <div style={{
                            position: 'relative'
                        }}>
                            <Button color="default" variant="filled" className={cls.triggerBtn} icon={<NotificationOutlined />} />
                            {!!notificationIds.notRead.length && (
                                <div
                                    className={cls.badge}
                                >
                                    <MyTypography.Small strong style={{ margin: 0 }}>
                                        {notificationIds.notRead.length}
                                    </MyTypography.Small>
                                </div>
                            )}
                        </div>
                    </Tooltip>
                </Popover>
            </BrowserView>
            <MobileView>
                <div style={{
                    position: 'relative'
                }}>
                    <Button onClick={() => setOpen(true)} color="default" variant="filled" className={cls.triggerBtn} icon={<NotificationOutlined />} />
                    {!!notificationIds.notRead.length && (
                        <div
                            className={cls.badge}
                        >
                            <MyTypography.Small strong style={{ margin: 0 }}>
                                {notificationIds.notRead.length}
                            </MyTypography.Small>
                        </div>
                    )}
                </div>
                <Drawer isOpen={open} onClose={onClose}>
                    {content}
                </Drawer>
            </MobileView>
        </div>
    );
});

export const UserNotification = memo(() => {
    const userInfo = useUserInfo();
    if (!userInfo) {
        return null;
    }

    return (
        <UserNotificationDefault />
    );
});
