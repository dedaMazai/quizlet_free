import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Select } from 'antd';
import {
  ChevronDown, Layers, Search, SearchX,
} from 'lucide-react';
import { DeckList } from '@/widgets/DeckList';
import { LibraryHeader } from '@/widgets/LibraryHeader';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';
import { EmptyState } from '@/shared/ui/EmptyState';
import cls from './DecksPage.module.scss';

type DeckFilter = 'all' | 'own' | 'shared';
type DeckSort = 'recent' | 'name';

const SEARCH_ICON_SIZE = 15;
const MOBILE_SEARCH_ICON_SIZE = 16;
const CHEVRON_SIZE = 14;
const ICON_STROKE = 1.5;

const DecksPage = () => {
  const { t } = useTranslation();
  const [search, debouncedSearch, setSearchImmediate, setSearchDebounced] = useDebounceState('');
  const [filter, setFilter] = useState<DeckFilter>('all');
  const [sort, setSort] = useState<DeckSort>('recent');
  const { isMobile } = useMatchMedia();

  const hasFilters = Boolean(debouncedSearch.trim()) || (!isMobile && filter !== 'all');
  const resetFilters = () => {
    setSearchImmediate('');
    setFilter('all');
  };
  const empty = hasFilters ? (
    <EmptyState
      icon={SearchX}
      kicker={t('Ничего не найдено')}
      title={debouncedSearch.trim()
        ? t('По «{{query}}» нет колод', { query: debouncedSearch.trim() })
        : t('Нет колод по этим фильтрам')}
      description={t('Проверьте написание или сбросьте фильтры.')}
      primary={{ label: t('Сбросить фильтры'), onClick: resetFilters }}
    />
  ) : (
    <EmptyState
      icon={Layers}
      kicker={t('Начало')}
      title={t('Создайте первую колоду')}
      description={t('Колода — набор слов с переводами, из неё строятся все режимы.')}
    />
  );

  return (
    <div className={cls.DecksPage}>
      <LibraryHeader showCreateDeck />

      <div className={cls.toolbar}>
        <Input
          className={cls.search}
          prefix={(
            <Search
              aria-hidden
              size={isMobile ? MOBILE_SEARCH_ICON_SIZE : SEARCH_ICON_SIZE}
              strokeWidth={ICON_STROKE}
            />
          )}
          allowClear
          value={search}
          aria-label={t('Название колоды')}
          placeholder={t('Название колоды')}
          onChange={(e) => setSearchDebounced(e.target.value)}
        />
        {/* Фильтра и сортировки нет в мобильном макете 6.38 */}
        {!isMobile && (
          <BoxSegmented<DeckFilter>
            value={filter}
            onChange={setFilter}
            options={[
              { label: t('Все'), value: 'all' },
              { label: t('Мои'), value: 'own' },
              { label: t('Доступные мне'), value: 'shared' },
            ]}
          />
        )}
        {!isMobile && (
          <Select<DeckSort>
            className={cls.sort}
            aria-label={t('Сортировка')}
            value={sort}
            onChange={setSort}
            suffixIcon={<ChevronDown aria-hidden size={CHEVRON_SIZE} strokeWidth={ICON_STROKE} />}
            options={[
              { label: t('Сначала недавние'), value: 'recent' },
              { label: t('По названию'), value: 'name' },
            ]}
          />
        )}
      </div>

      {/* Фильтра и сортировки на мобильном нет — выбранные на широком экране не действуют */}
      <DeckList
        filter={isMobile ? 'all' : filter}
        sort={isMobile ? 'recent' : sort}
        search={debouncedSearch}
        empty={empty}
      />
    </div>
  );
};

export default DecksPage;
