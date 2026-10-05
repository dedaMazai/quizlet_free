import { CardType } from '../types/card';
import { CardStatus } from '../types/cardReview';

/** Фильтр выборки библиотеки — он же передаётся в сессию через query-параметры. */
export interface LibraryFilter {
  search?: string;
  deckUuid?: string;
  status?: CardStatus;
  type?: CardType;
}

const PARAMS = {
  search: 'q',
  deckUuid: 'deck',
  status: 'status',
  type: 'type',
} as const;

const STATUSES: CardStatus[] = ['new', 'learning', 'mastered', 'due'];
const TYPES: CardType[] = ['word', 'phrase'];

const isStatus = (value: string | null): value is CardStatus => (
  STATUSES.includes(value as CardStatus)
);
const isType = (value: string | null): value is CardType => TYPES.includes(value as CardType);

export const hasLibraryFilter = (filter: LibraryFilter): boolean => Boolean(
  filter.search?.trim() || filter.deckUuid || filter.status || filter.type,
);

/** «?q=&deck=&status=&type=» — только заданные поля; без фильтра — пустая строка. */
export const libraryFilterToSearch = (filter: LibraryFilter): string => {
  const params = new URLSearchParams();
  const search = filter.search?.trim();
  if (search) params.set(PARAMS.search, search);
  if (filter.deckUuid) params.set(PARAMS.deckUuid, filter.deckUuid);
  if (filter.status) params.set(PARAMS.status, filter.status);
  if (filter.type) params.set(PARAMS.type, filter.type);
  const query = params.toString();
  return query ? `?${query}` : '';
};

export const libraryFilterFromParams = (params: URLSearchParams): LibraryFilter => {
  const status = params.get(PARAMS.status);
  const type = params.get(PARAMS.type);
  return {
    search: params.get(PARAMS.search) ?? undefined,
    deckUuid: params.get(PARAMS.deckUuid) ?? undefined,
    status: isStatus(status) ? status : undefined,
    type: isType(type) ? type : undefined,
  };
};
