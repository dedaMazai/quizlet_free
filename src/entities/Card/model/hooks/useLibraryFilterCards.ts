import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetLibraryCardsQuery } from '../api/cardApi';
import { hasLibraryFilter, libraryFilterFromParams } from '../lib/libraryFilter';
import { Card } from '../types/card';

interface UseLibraryFilterCardsOptions {
  /** Сузить выборку конкретными карточками (избранное). */
  uuids?: string[];
  skip?: boolean;
}

/**
 * Карточки сессии по фильтру выборки из query-параметров («Заучивать выборку»).
 * Без фильтра — переданный полный список.
 */
export const useLibraryFilterCards = (
  allCards: Card[] | undefined,
  options: UseLibraryFilterCardsOptions = {},
) => {
  const { uuids, skip } = options;
  const [params] = useSearchParams();
  const filter = useMemo(() => libraryFilterFromParams(params), [params]);
  const active = hasLibraryFilter(filter);

  const { data, isLoading } = useGetLibraryCardsQuery(
    { ...filter, uuids },
    { skip: !active || skip },
  );

  const cards = useMemo(
    () => (active ? data?.items.map((item) => item.card) : allCards),
    [active, data, allCards],
  );

  return { cards, isLoading: active && (isLoading || !data) };
};
