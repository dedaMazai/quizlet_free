export interface Deck {
  uuid: string;
  name: string;
  description?: string;
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
