export { useNotificationsRealtime } from './model/hooks/useNotificationsRealtime';
export { getNotificationLink } from './model/lib/getNotificationLink';
export { getNotificationText } from './model/lib/getNotificationText';
export { NotificationType } from './model/types/notification';
export type { AppNotification, NotificationPayload } from './model/types/notification';
export {
    useGetNotificationsQuery,
    useMarkReadNotificationsMutation,
    useDeleteNotificationsMutation,
} from './model/api/notificationsApi';
