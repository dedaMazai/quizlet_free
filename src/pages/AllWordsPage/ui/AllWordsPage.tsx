import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from 'antd';
import { ReadOutlined, BulbOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetCardsQuery } from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { CardList } from '@/widgets/CardList';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './AllWordsPage.module.scss';

const AllWordsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: cards } = useGetCardsQuery();
  const { data: decks } = useGetDecksQuery();

  const [search, debouncedSearch, , setSearchDebounced] = useDebounceState('');
  const [deckFilter, setDeckFilter] = useState<string | undefined>(undefined);

  const deckOptions = useMemo(
    () => (decks ?? []).map((deck) => ({ value: deck.uuid, label: deck.name })),
    [decks],
  );

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return (cards ?? []).filter((card) => {
      if (deckFilter && card.deck_uuid !== deckFilter) return false;
      if (!query) return true;
      return card.term.toLowerCase().includes(query)
        || card.translation.toLowerCase().includes(query)
        || (card.example?.toLowerCase().includes(query) ?? false);
    });
  }, [cards, deckFilter, debouncedSearch]);

  const totalCount = cards?.length ?? 0;
  const isEmpty = totalCount === 0;
  const hasFilter = Boolean(debouncedSearch.trim() || deckFilter);

  return (
    <VStack max fullHeight gap="16">
      <HStack max justify="between" align="start" gap="16" wrap>
        <VStack gap="4">
          <MyTypography.Large strong>{t('Все слова')}</MyTypography.Large>
          <MyTypography.Base type="secondary">
            {t('{{count}} слов', { count: filtered.length })}
          </MyTypography.Base>
        </VStack>
        <HStack gap="8" wrap>
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
        </HStack>
      </HStack>

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
        cards={filtered}
        emptyText={hasFilter ? t('Ничего не найдено') : undefined}
      />
    </VStack>
  );
};

export default AllWordsPage;
