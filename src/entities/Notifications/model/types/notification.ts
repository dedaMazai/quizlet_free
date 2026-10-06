export enum NotificationType {
    CONTACT_REQUEST = 'contact_request',
    CONTACT_ACCEPTED = 'contact_accepted',
    DECK_SHARED = 'deck_shared',
}

/** Снимок на момент события: имя автора и колоды могли с тех пор измениться */
export interface NotificationPayload {
    actor_name?: string;
    deck_name?: string;
}

export interface AppNotification {
    id: string;
    type: NotificationType;
    actor_id?: string;
    /** deck_shared — id колоды, contact_request — id запроса, contact_accepted — id нового контакта */
    entity_id?: string;
    payload: NotificationPayload;
    created_at: string;
    read_at?: string;
}
