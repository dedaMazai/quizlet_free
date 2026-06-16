import {
    useEffect,
    useCallback,
    useState,
    useMemo,
    useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { getCookie } from 'typescript-cookie';
import { io, Socket } from 'socket.io-client';
import { useNotificationFn } from '@/shared/lib/context/NotificationContext';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { useUserInfo } from '@/entities/User';
import { ApiTag } from '@/shared/api/rtkApi';
import { notificationsApi, WsNotification } from '../api/notificationsApi';
import { getNotificationLink } from '../lib/getNotificationLink';

const getBaseUrl = (): string => {
    const url = new URL(__API__);
    return url.origin;
};

const logDev = (message: string, data?: unknown) => {
    if (__IS_DEV__) {
        console.log(message, data);
    }
};

const logDevError = (message: string, error?: unknown) => {
    if (__IS_DEV__) {
        console.error(message, error);
    }
};

export const useNotificationWebsocket = () => {
    const { t } = useTranslation();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const notification = useNotificationFn();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const userInfo = useUserInfo();

    const showNotificationRef = useRef<(ws: WsNotification) => void>(undefined);
    const invalidateRef = useRef<() => void>(undefined);

    const token = useMemo(() => {
        if (userInfo?.uuid) {
            return getCookie('dev_access_token');
        }

        return undefined;
    }, [userInfo?.uuid]);

    const invalidateNotifications = useCallback(() => {
        dispatch(notificationsApi.util.invalidateTags([ApiTag.Notifications]));
    }, [dispatch]);

    const showNotification = useCallback(
        (wsNotification: WsNotification) => {
            const link = getNotificationLink({
                entity: wsNotification.entity,
                entity_uuid: wsNotification.entity_uuid,
                extra: wsNotification.extra,
            });

            const buttonData = link
                ? {
                    title: t('Открыть'),
                    handler: () => navigate(link),
                }
                : undefined;

            notification?.info({
                message: wsNotification.text,
                btn: buttonData
                    ? (
                        <Button onClick={buttonData.handler} type="primary">
                            {buttonData.title}
                        </Button>
                    )
                    : undefined,
            });
        },
        [notification, navigate, t],
    );

    showNotificationRef.current = showNotification;
    invalidateRef.current = invalidateNotifications;

    const cleanupSocket = useCallback(() => {
        if (socketRef.current) {
            logDev('Cleaning up Socket.IO connection');
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        if (!userInfo?.uuid || !token) {
            cleanupSocket();
            return undefined;
        }

        if (socketRef.current?.connected) {
            return undefined;
        }

        cleanupSocket();

        try {
            const baseUrl = getBaseUrl();
            logDev('Creating new Socket.IO connection:', baseUrl);

            const socket = io(baseUrl, {
                path: '/api/ws/notifications/',
                autoConnect: true,
                transports: ['websocket', 'polling'],
                auth: { token },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                logDev('Socket.IO connected');
                setIsConnected(true);
            });

            socket.on('notification', (data: WsNotification) => {
                showNotificationRef.current?.(data);
                invalidateRef.current?.();
            });

            socket.on('disconnect', (reason) => {
                setIsConnected(false);
                logDev('Socket.IO disconnected:', reason);
                invalidateRef.current?.();
            });

            socket.on('connect_error', (error) => {
                setIsConnected(false);
                logDevError('Socket.IO connection error:', error);
            });
        } catch (error) {
            logDevError('Failed to initialize Socket.IO:', error);
        }

        return () => {
            cleanupSocket();
        };
    }, [userInfo?.uuid, token, cleanupSocket]);

    return {
        isConnected,
    };
};
