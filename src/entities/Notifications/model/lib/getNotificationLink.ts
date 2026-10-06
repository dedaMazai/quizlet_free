import { RoutePath } from '@/shared/config/router/routePath';
import { AppNotification, NotificationType } from '../types/notification';

export const getNotificationLink = (notification: AppNotification): string | null => {
    switch (notification.type) {
    case NotificationType.CONTACT_REQUEST:
    case NotificationType.CONTACT_ACCEPTED:
        return RoutePath.CONTACTS();
    case NotificationType.DECK_SHARED:
        return notification.entity_id ? RoutePath.DECK(notification.entity_id) : null;
    default:
        return null;
    }
};
