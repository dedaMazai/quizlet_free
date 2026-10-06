/** Метка контакта: видна только владельцу списка */
export enum ContactLabel {
  FRIEND = 'friend',
  STUDENT = 'student',
  TEACHER = 'teacher',
}

export interface Contact {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  label?: ContactLabel;
  created_at: string;
}

/** Входящий запрос в контакты */
export interface ContactRequest {
  id: string;
  from_id: string;
  email: string;
  name?: string;
  avatar?: string;
  created_at: string;
}

/** Своя ссылка-приглашение */
export interface ContactInvite {
  token: string;
  expires_at: string;
}

/** Кто приглашает — для экрана подтверждения */
export interface ContactInviteInfo {
  inviter_name: string;
  avatar?: string;
  is_self: boolean;
  is_contact: boolean;
}
