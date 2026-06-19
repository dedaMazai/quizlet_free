export interface Deck {
  uuid: string;
  name: string;
  description?: string;
  owner_id: string;
  /** Текущий пользователь — владелец колоды (может редактировать, делиться, удалять). */
  is_owner: boolean;
  /** Имя автора (для показа на расшаренной колоде). */
  owner_name?: string;
  owner_email?: string;
  created_at: string;
  updated_at: string;
}

export interface DeckCreateDto {
  name: string;
  description?: string;
}

export interface DeckUpdateDto {
  uuid: string;
  name: string;
  description?: string;
}

/** Пользователь, которому открыт доступ к колоде. */
export interface DeckShareUser {
  user_id: string;
  email: string;
  name?: string;
}
