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

/** Параметры серверной страницы слов (пагинация, поиск, фильтры). */
export interface CardsPageArgs {
  page: number;
  pageSize: number;
  /** Поиск по слову, переводу и примеру (без учёта регистра). */
  search?: string;
  deckUuid?: string;
  /** Ограничить выборку конкретными карточками (например, избранными). */
  uuids?: string[];
}

export interface CardsPage {
  cards: Card[];
  /** Общее число строк с учётом фильтров (для пагинации). */
  total: number;
}
