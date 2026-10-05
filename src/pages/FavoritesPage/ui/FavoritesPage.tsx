import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  hasLibraryFilter,
  libraryFilterToSearch,
  useGetFavoritesQuery,
  useGetLibraryCardsQuery,
} from '@/entities/Card';
import { LibraryFilters, useLibraryFilters } from '@/features/LibraryFilters';
import { CardList } from '@/widgets/CardList';
import { LibraryHeader } from '@/widgets/LibraryHeader';
import { SelectionStrip } from '@/widgets/SelectionStrip';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './FavoritesPage.module.scss';

const PAGE_SIZE = 50;

const FavoritesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const filters = useLibraryFilters();
  const { filter } = filters;
  const [page, setPage] = useState(1);

  const { data: favorites } = useGetFavoritesQuery();
  // Сортированная копия — стабильный ключ кэша RTK Query при том же наборе избранного.
  const uuids = useMemo(() => [...(favorites ?? [])].sort(), [favorites]);
  const { data, isLoading } = useGetLibraryCardsQuery(
    {
      ...filter, uuids, page, pageSize: PAGE_SIZE,
    },
    { skip: !favorites },
  );
  const total = data?.total ?? 0;

  // При смене фильтра начинаем с первой страницы.
  useEffect(() => {
    setPage(1);
  }, [filter]);

  // Если текущая страница опустела (сняли звёздочки) — откатываемся назад.
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [total, page]);

  // Сессия по текущей выборке: фильтр уходит в query-параметры
  const query = libraryFilterToSearch(filter);

  return (
    <div className={cls.FavoritesPage}>
      <LibraryHeader />
      <LibraryFilters state={filters} />
      <SelectionStrip
        title={t('{{count}} слов', { count: total })}
        subtitle={`${t('отмечены звёздочкой')} · ${t('из {{count}} колод', { count: data?.deckCount ?? 0 })}`}
        cta={t('Заучивать избранное')}
        disabled={total === 0}
        onCards={() => navigate(`${RoutePath.FAVORITES_FLASHCARDS()}${query}`)}
        onLearn={() => navigate(`${RoutePath.FAVORITES_LEARN()}${query}`)}
      />
      <CardList
        items={data?.items}
        loading={isLoading || !favorites}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          onChange: setPage,
        }}
        emptyText={hasLibraryFilter(filter) ? t('Ничего не найдено') : t('В избранном пока нет слов')}
      />
    </div>
  );
};

export default FavoritesPage;
