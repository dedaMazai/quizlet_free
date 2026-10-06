import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useToast } from '@/shared/lib/toast';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { useUserInfo } from '@/entities/User';
import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase } from '@/shared/api/supabaseClient';
import { mapNotification } from '../api/notificationsApi';
import { getNotificationLink } from '../lib/getNotificationLink';
import { getNotificationText } from '../lib/getNotificationText';
import { AppNotification, NotificationType } from '../types/notification';

type NotificationRow = Parameters<typeof mapNotification>[0];

// Какие данные устаревают с приходом уведомления
const RELATED_TAGS: Record<NotificationType, ApiTag[]> = {
    [NotificationType.CONTACT_REQUEST]: [ApiTag.ContactRequests],
    [NotificationType.CONTACT_ACCEPTED]: [ApiTag.Contacts],
    [NotificationType.DECK_SHARED]: [ApiTag.Decks],
};

/** Новые уведомления через Supabase Realtime: обновить колокольчик и показать тост */
export const useNotificationsRealtime = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const userId = useUserInfo()?.uuid;

    // Подписка живёт, пока не сменился пользователь; свежие t/toast/navigate берём из ref
    const onInsertRef = useRef<(notification: AppNotification) => void>(undefined);
    onInsertRef.current = (notification) => {
        dispatch(rtkApi.util.invalidateTags([ApiTag.Notifications, ...(RELATED_TAGS[notification.type] ?? [])]));
        const link = getNotificationLink(notification);
        toast.info(getNotificationText(t, notification), {
            action: link ? { label: t('Открыть'), onClick: () => navigate(link) } : undefined,
        });
    };

    useEffect(() => {
        if (!userId) return undefined;

        // RLS select применяется и к Realtime: чужие строки не придут даже без фильтра
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}`,
                },
                (event) => onInsertRef.current?.(mapNotification(event.new as NotificationRow)),
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);
};
