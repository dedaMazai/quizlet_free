import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from 'antd';
import { ReadOutlined, BulbOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetCardsPageQuery, useGetCardsCountQuery } from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { CardList } from '@/widgets/CardList';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './AllWordsPage.module.scss';

const AllWordsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: decks } = useGetDecksQuery();
  const { data: totalWords } = useGetCardsCountQuery();

  const [search, debouncedSearch, , setSearchDebounced] = useDebounceState('');
  const [deckFilter, setDeckFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const trimmedSearch = debouncedSearch.trim();
  const { data: cardsPage, isLoading } = useGetCardsPageQuery({
    page,
    pageSize,
    search: trimmedSearch || undefined,
    deckUuid: deckFilter,
  });
  const total = cardsPage?.total ?? 0;

  // При смене поиска/фильтра начинаем с первой страницы.
  useEffect(() => {
    setPage(1);
  }, [trimmedSearch, deckFilter]);

  // Если текущая страница опустела (например, после удаления слов) — откатываемся назад.
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, pageSize]);

  const deckOptions = useMemo(
    () => (decks ?? []).map((deck) => ({ value: deck.uuid, label: deck.name })),
    [decks],
  );

  const isEmpty = (totalWords ?? 0) === 0;
  const hasFilter = Boolean(trimmedSearch || deckFilter);

  return (
    <VStack max fullHeight gap="16">
      <SectionPageHeader
        section={NavSectionKey.LIBRARY}
        extra={(
          <>
            <Button
              icon={<ReadOutlined />}
              disabled={isEmpty}
              onClick={() => navigate(RoutePath.ALL_WORDS_FLASHCARDS())}
            >
              {t('Карточки')}
            </Button>
            <Button
              type="primary"
              icon={<BulbOutlined />}
              disabled={isEmpty}
              onClick={() => navigate(RoutePath.ALL_WORDS_LEARN())}
            >
              {t('Заучивание')}
            </Button>
          </>
        )}
      />
      <MyTypography.Base type="secondary">
        {t('{{count}} слов', { count: total })}
      </MyTypography.Base>

      <HStack max gap="8" wrap>
        <Input
          className={cls.search}
          prefix={<SearchOutlined />}
          allowClear
          value={search}
          placeholder={t('Поиск слов')}
          onChange={(e) => setSearchDebounced(e.target.value)}
        />
        <Select
          className={cls.deckSelect}
          allowClear
          value={deckFilter}
          placeholder={t('Все колоды')}
          options={deckOptions}
          onChange={(value) => setDeckFilter(value)}
        />
      </HStack>

      <CardList
        cards={cardsPage?.cards}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
        emptyText={hasFilter ? t('Ничего не найдено') : undefined}
      />
    </VStack>
  );
};

export default AllWordsPage;
