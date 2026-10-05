import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  hasLibraryFilter, libraryFilterToSearch, useGetLibraryCardsQuery,
} from '@/entities/Card';
import { LibraryFilters, useLibraryFilters } from '@/features/LibraryFilters';
import { CardList } from '@/widgets/CardList';
import { LibraryHeader } from '@/widgets/LibraryHeader';
import { SelectionStrip } from '@/widgets/SelectionStrip';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './AllWordsPage.module.scss';

const PAGE_SIZE = 50;

const AllWordsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const filters = useLibraryFilters();
  const { filter } = filters;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetLibraryCardsQuery({ ...filter, page, pageSize: PAGE_SIZE });
  const total = data?.total ?? 0;

  // При смене фильтра начинаем с первой страницы.
  useEffect(() => {
    setPage(1);
  }, [filter]);

  // Если текущая страница опустела (например, после удаления слов) — откатываемся назад.
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > maxPage) setPage(maxPage);
  }, [total, page]);

  // Сессия по текущей выборке: фильтр уходит в query-параметры
  const query = libraryFilterToSearch(filter);

  return (
    <div className={cls.AllWordsPage}>
      <LibraryHeader />
      <LibraryFilters state={filters} withStatus />
      <SelectionStrip
        title={t('{{count}} слов', { count: total })}
        subtitle={`${t('в фильтре')} · ${t('из {{count}} колод', { count: data?.deckCount ?? 0 })}`}
        cta={t('Заучивать выборку')}
        disabled={total === 0}
        onCards={() => navigate(`${RoutePath.ALL_WORDS_FLASHCARDS()}${query}`)}
        onLearn={() => navigate(`${RoutePath.ALL_WORDS_LEARN()}${query}`)}
      />
      <CardList
        items={data?.items}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          onChange: setPage,
        }}
        emptyText={hasLibraryFilter(filter) ? t('Ничего не найдено') : undefined}
      />
    </div>
  );
};

export default AllWordsPage;
