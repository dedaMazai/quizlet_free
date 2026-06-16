export { useNotificationWebsocket } from './model/hooks/useNotificationWebsocket';
export { getNotificationLink } from './model/lib/getNotificationLink';
export {
    useGetNotificationsQuery,
    useGetNotificationQuery,
    useMarkReadNotificationsMutation,
    useDeleteNotificationsMutation,
} from './model/api/notificationsApi';
export type {
    NotificationsForm,
    NotificationReadSchema,
    NotificationEntityEnum,
    NotificationsFilters,
    NotificationMarkReadSchema,
    NotificationDeleteSchema,
    WsNotification,
    EventType,
    NotificationExtra,
} from './model/api/notificationsApi';
