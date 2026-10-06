import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError } from '@/shared/api/supabaseClient';
import { AppNotification, NotificationPayload, NotificationType } from '../types/notification';

// Таблица notifications (supabase/contacts.sql): RLS отдаёт только свои строки,
// создают их только RPC контактов и шаринга.
const NOTIFICATIONS_LIMIT = 50;

interface NotificationRow {
    id: string;
    type: NotificationType;
    actor_id: string | null;
    entity_id: string | null;
    payload: NotificationPayload | null;
    created_at: string;
    read_at: string | null;
}

export const mapNotification = (row: NotificationRow): AppNotification => ({
    id: row.id,
    type: row.type,
    actor_id: row.actor_id ?? undefined,
    entity_id: row.entity_id ?? undefined,
    payload: row.payload ?? {},
    created_at: row.created_at,
    read_at: row.read_at ?? undefined,
});

export const notificationsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getNotifications: build.query<AppNotification[], void>({
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('notifications')
                    .select('id, type, actor_id, entity_id, payload, created_at, read_at')
                    .order('created_at', { ascending: false })
                    .limit(NOTIFICATIONS_LIMIT);
                if (error) return supabaseError(error.message);
                return { data: (data as NotificationRow[]).map(mapNotification) };
            },
            providesTags: [ApiTag.Notifications],
        }),
        markReadNotifications: build.mutation<void, string[]>({
            queryFn: async (ids) => {
                if (!ids.length) return { data: undefined };
                const { error } = await supabase
                    .from('notifications')
                    .update({ read_at: new Date().toISOString() })
                    .in('id', ids)
                    .is('read_at', null);
                if (error) return supabaseError(error.message);
                return { data: undefined };
            },
            invalidatesTags: [ApiTag.Notifications],
        }),
        deleteNotifications: build.mutation<void, string[]>({
            queryFn: async (ids) => {
                if (!ids.length) return { data: undefined };
                const { error } = await supabase.from('notifications').delete().in('id', ids);
                if (error) return supabaseError(error.message);
                return { data: undefined };
            },
            invalidatesTags: [ApiTag.Notifications],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkReadNotificationsMutation,
    useDeleteNotificationsMutation,
} = notificationsApi;
