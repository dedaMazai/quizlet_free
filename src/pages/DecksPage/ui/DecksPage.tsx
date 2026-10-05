import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Segmented, Select } from 'antd';
import { ChevronDown, Search } from 'lucide-react';
import { DeckList } from '@/widgets/DeckList';
import { LibraryHeader } from '@/widgets/LibraryHeader';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './DecksPage.module.scss';

type DeckFilter = 'all' | 'own' | 'shared';
type DeckSort = 'recent' | 'name';

const SEARCH_ICON_SIZE = 15;
const MOBILE_SEARCH_ICON_SIZE = 16;
const CHEVRON_SIZE = 14;
const ICON_STROKE = 1.5;

const DecksPage = () => {
  const { t } = useTranslation();
  const [search, debouncedSearch, , setSearchDebounced] = useDebounceState('');
  const [filter, setFilter] = useState<DeckFilter>('all');
  const [sort, setSort] = useState<DeckSort>('recent');
  const { isMobile } = useMatchMedia();

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
          placeholder={t('Название колоды')}
          onChange={(e) => setSearchDebounced(e.target.value)}
        />
        {/* Фильтра и сортировки нет в мобильном макете 6.38 */}
        {!isMobile && (
          <Segmented<DeckFilter>
            className={cls.segmented}
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
      />
    </div>
  );
};

export default DecksPage;
