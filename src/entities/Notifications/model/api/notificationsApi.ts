import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { BaseEntityFields, PaginationResult } from '@/shared/types/types';

export type NotificationEntityEnum =
    | 'user'
    | 'document'
    | 'collection'
    | 'group'
    | 'comment';

export type EventType =
    | 'comment_reply'
    | 'user_added_to_group'
    | 'user_removed_from_group'
    | 'user_membership_access_granted'
    | 'user_membership_access_revoked'
    | 'user_mentioned';

export interface NotificationExtra {
    event_type: EventType;
    actor_uuid: string;
    actor_name: string;
    [key: string]: string;
}

export interface NotificationReadSchema extends Omit<BaseEntityFields, 'deleted_at'> {
    read_at?: string;
    entity: NotificationEntityEnum;
    entity_uuid: string;
    text: string;
    extra?: NotificationExtra;
    user_uuid_to: string;
}

/** @deprecated Use NotificationReadSchema instead */
export type NotificationsForm = NotificationReadSchema;

export interface WsNotification {
    event_uuid: string;
    entity: NotificationEntityEnum;
    entity_uuid: string;
    text: string;
    created_at: string;
    extra: NotificationExtra;
}

export interface NotificationsFilters {
    limit?: number;
    page?: number;
    order_by?: 'created_at' | 'updated_at' | 'read_at';
    order?: 'asc' | 'desc';
    uuid__in?: string[];
    read_at__isnull?: boolean;
}

export interface NotificationMarkReadSchema {
    notification_uuids: string[];
}

export type NotificationDeleteSchema = NotificationMarkReadSchema;

export const notificationsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getNotifications: build.query<PaginationResult<NotificationReadSchema>, NotificationsFilters | void>({
            query: (params) => ({
                url: '/notifications/me',
                params: params || undefined,
            }),
            providesTags: [ApiTag.Notifications],
        }),
        getNotification: build.query<NotificationReadSchema, string>({
            query: (notificationUuid) => ({
                url: `/notifications/${notificationUuid}`,
            }),
            providesTags: (_result, _error, notificationUuid) => [
                { type: ApiTag.Notification, id: notificationUuid },
            ],
        }),
        markReadNotifications: build.mutation<void, NotificationMarkReadSchema>({
            query: (body) => ({
                url: '/notifications/mark-read',
                method: 'POST',
                body,
            }),
            invalidatesTags: [ApiTag.Notifications],
        }),
        deleteNotifications: build.mutation<void, NotificationDeleteSchema>({
            query: (body) => ({
                url: '/notifications',
                method: 'DELETE',
                body,
            }),
            invalidatesTags: [ApiTag.Notifications],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetNotificationQuery,
    useMarkReadNotificationsMutation,
    useDeleteNotificationsMutation,
} = notificationsApi;
