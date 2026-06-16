export interface Card {
  uuid: string;
  deck_uuid: string;
  term: string; // английское слово
  translation: string; // русский перевод
  example?: string; // опциональный пример употребления
  created_at: string;
  updated_at: string;
}

export interface CardCreateDto {
  deck_uuid: string;
  term: string;
  translation: string;
  example?: string;
}

export interface CardUpdateDto {
  uuid: string;
  term: string;
  translation: string;
  example?: string;
}
