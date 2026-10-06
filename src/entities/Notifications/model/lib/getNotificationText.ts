import type { TFunction } from 'i18next';
import { AppNotification, NotificationType } from '../types/notification';

export const getNotificationText = (t: TFunction, notification: AppNotification): string => {
    const name = notification.payload.actor_name ?? t('Пользователь');

    switch (notification.type) {
    case NotificationType.CONTACT_REQUEST:
        return t('{{name}} хочет добавить вас в контакты', { name });
    case NotificationType.CONTACT_ACCEPTED:
        return t('{{name}} теперь в ваших контактах', { name });
    case NotificationType.DECK_SHARED:
        return t('{{name}} делится с вами колодой «{{deck}}»', { name, deck: notification.payload.deck_name ?? '' });
    default:
        return '';
    }
};
