import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Dropdown, Input, MenuProps, Select,
} from 'antd';
import { ChevronDown, Search, X } from 'lucide-react';
import { CardStatus, CardType } from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { classNames } from '@/shared/lib/classNames/classNames';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';
import { LibraryFiltersState } from '../model/useLibraryFilters';
import cls from './LibraryFilters.module.scss';

const SEARCH_ICON_SIZE = 15;
const SMALL_ICON_SIZE = 14;
const ICON_STROKE = 1.5;

interface LibraryFiltersProps {
  state: LibraryFiltersState;
  /** Фильтр статуса — только во «Всех словах» */
  withStatus?: boolean;
}

/** Поиск, колода, статус и тип — фильтры выборки библиотеки (6.4–6.5) */
export const LibraryFilters = memo(({ state, withStatus }: LibraryFiltersProps) => {
  const {
    search, setSearch, deckUuid, setDeckUuid, status, setStatus, type, setType,
  } = state;
  const { t } = useTranslation();
  const { data: decks } = useGetDecksQuery();

  const deckOptions = useMemo(
    () => (decks ?? []).map((deck) => ({ value: deck.uuid, label: deck.name })),
    [decks],
  );

  const statusLabels: Record<CardStatus, string> = {
    new: t('Новое'),
    learning: t('Изучаю'),
    mastered: t('Усвоено'),
    due: t('Повторить'),
  };
  const statusItems: MenuProps['items'] = (Object.keys(statusLabels) as CardStatus[])
    .map((key) => ({ key, label: statusLabels[key] }));

  return (
    <div className={cls.LibraryFilters}>
      <Input
        className={cls.search}
        prefix={<Search aria-hidden size={SEARCH_ICON_SIZE} strokeWidth={ICON_STROKE} />}
        allowClear
        value={search}
        aria-label={t('Слово, перевод или пример')}
        placeholder={t('Слово, перевод или пример')}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Select
        className={cls.deckSelect}
        aria-label={t('Колода')}
        allowClear
        showSearch
        optionFilterProp="label"
        value={deckUuid}
        placeholder={t('Все колоды')}
        options={deckOptions}
        suffixIcon={<ChevronDown aria-hidden size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />}
        onChange={setDeckUuid}
      />
      {withStatus && (status ? (
        <Button
          className={classNames(cls.status, [cls.statusActive])}
          aria-label={t('Сбросить статус')}
          onClick={() => setStatus(undefined)}
        >
          {t('Статус: {{status}}', { status: statusLabels[status].toLowerCase() })}
          <X aria-hidden size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />
        </Button>
      ) : (
        <Dropdown
          trigger={['click']}
          menu={{ items: statusItems, onClick: ({ key }) => setStatus(key as CardStatus) }}
        >
          <Button className={cls.status}>
            {t('Статус')}
            <ChevronDown aria-hidden size={SMALL_ICON_SIZE} strokeWidth={ICON_STROKE} />
          </Button>
        </Dropdown>
      ))}
      <BoxSegmented<CardType | 'all'>
        value={type}
        onChange={setType}
        options={[
          { label: t('Все'), value: 'all' },
          { label: t('Слова'), value: 'word' },
          { label: t('Фразы'), value: 'phrase' },
        ]}
      />
    </div>
  );
});

LibraryFilters.displayName = 'LibraryFilters';
