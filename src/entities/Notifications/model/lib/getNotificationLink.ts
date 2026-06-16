import { NotificationEntityEnum, NotificationExtra } from '../api/notificationsApi';

interface GetNotificationLinkParams {
    entity: NotificationEntityEnum;
    entity_uuid: string;
    extra?: NotificationExtra;
}

export const getNotificationLink = (params: GetNotificationLinkParams): string | null => {
    const { entity, entity_uuid, extra } = params;
    const eventType = extra?.event_type;

    if (!eventType) {
        return null;
    }

    switch (eventType) {
        case 'comment_reply':
        case 'user_mentioned':
            return extra.document_uuid ? `/documents/${extra.document_uuid}` : null;

        case 'user_membership_access_granted': {
            if (entity === 'document') {
                return `/documents/${entity_uuid}`;
            }
            if (entity === 'collection') {
                return `/collections/${entity_uuid}`;
            }
            return null;
        }

        case 'user_added_to_group':
        case 'user_removed_from_group':
        case 'user_membership_access_revoked':
            return null;

        default:
            return null;
    }
};
