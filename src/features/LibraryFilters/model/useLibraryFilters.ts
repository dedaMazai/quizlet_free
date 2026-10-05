import { useMemo, useState } from 'react';
import { CardStatus, CardType, LibraryFilter } from '@/entities/Card';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';

export interface LibraryFiltersState {
  /** Текст в поле поиска (без задержки) */
  search: string;
  setSearch: (value: string) => void;
  deckUuid?: string;
  setDeckUuid: (value: string | undefined) => void;
  status?: CardStatus;
  setStatus: (value: CardStatus | undefined) => void;
  type: CardType | 'all';
  setType: (value: CardType | 'all') => void;
  /** Итоговый фильтр выборки (поиск — с задержкой) */
  filter: LibraryFilter;
}

/** Состояние фильтров «Всех слов» / «Избранного» */
export const useLibraryFilters = (): LibraryFiltersState => {
  const [search, debouncedSearch, , setSearch] = useDebounceState('');
  const [deckUuid, setDeckUuid] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<CardStatus | undefined>(undefined);
  const [type, setType] = useState<CardType | 'all'>('all');

  const filter = useMemo<LibraryFilter>(() => ({
    search: debouncedSearch.trim() || undefined,
    deckUuid,
    status,
    type: type === 'all' ? undefined : type,
  }), [debouncedSearch, deckUuid, status, type]);

  return {
    search, setSearch, deckUuid, setDeckUuid, status, setStatus, type, setType, filter,
  };
};
