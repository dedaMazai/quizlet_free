import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, Modal, Select, Table,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Card, useGetCardsQuery, useGetFavoritesQuery } from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { CycleWord, useAddCycleWordsMutation } from '@/entities/LearningCycle';
import { HStack, VStack } from '@/shared/ui/Stack';
import { normalize } from '@/shared/lib/text';
import { useToast } from '@/shared/lib/toast';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { MODAL_MOTION } from '@/shared/const/motion';
import cls from './AddCycleWords.module.scss';

/** Значение селекта источника для избранного (остальные значения — uuid колод). */
const FAVORITES_SOURCE = '__favorites__';
const PAGE_SIZE = 50;
const MODAL_WIDTH = 720;
/** Таблица прокручивается внутри модалки, чтобы кнопки подтверждения оставались на экране. */
const TABLE_SCROLL = { y: '50vh' };

interface ImportCycleWordsModalProps {
  open: boolean;
  onClose: () => void;
  cycleUuid: string;
  words: CycleWord[];
}

/** Копирует выбранные карточки колоды или избранного в конец цикла. */
export const ImportCycleWordsModal: FC<ImportCycleWordsModalProps> = (props) => {
  const {
    open, onClose, cycleUuid, words,
  } = props;
  const { t } = useTranslation();
  const toast = useToast();
  const { isMobile } = useMatchMedia();
  const [source, setSource] = useState<string>(FAVORITES_SOURCE);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const isFavorites = source === FAVORITES_SOURCE;
  const { data: decks } = useGetDecksQuery(undefined, { skip: !open });
  const { data: favorites } = useGetFavoritesQuery(undefined, { skip: !open || !isFavorites });
  // Для избранного грузим все карточки и фильтруем по списку избранного.
  const { data: cards, isFetching } = useGetCardsQuery(isFavorites ? undefined : source, { skip: !open });
  const [addWords, { isLoading }] = useAddCycleWordsMutation();

  const sourceCards = useMemo(() => {
    if (!cards) return [];
    if (!isFavorites) return cards;
    const favSet = new Set(favorites ?? []);
    return cards.filter((c) => favSet.has(c.uuid));
  }, [cards, favorites, isFavorites]);

  const visibleCards = useMemo(() => {
    const query = normalize(search);
    if (!query) return sourceCards;
    return sourceCards.filter((c) => normalize(`${c.term} ${c.translation}`).includes(query));
  }, [sourceCards, search]);

  // Слова, которые уже есть в цикле, выбрать нельзя — чтобы не плодить дубли.
  const existingTerms = useMemo(() => new Set(words.map((w) => normalize(w.term))), [words]);

  const sourceOptions = useMemo(() => [
    { value: FAVORITES_SOURCE, label: t('Избранное') },
    ...(decks ?? []).map((d) => ({ value: d.uuid, label: d.name })),
  ], [decks, t]);

  const columns: TableColumnsType<Card> = [
    { title: t('Слово'), dataIndex: 'term' },
    { title: t('Перевод'), dataIndex: 'translation' },
  ];

  const handleSourceChange = (value: string) => {
    setSource(value);
    setSelected([]);
  };

  const handleClose = () => {
    setSelected([]);
    setSearch('');
    onClose();
  };

  const handleOk = async () => {
    const chosen = new Set(selected);
    // Порядок — как в источнике, а не как кликали.
    const toAdd = sourceCards
      .filter((c) => chosen.has(c.uuid))
      .map((c) => ({ term: c.term, translation: c.translation }));
    if (!toAdd.length) return;
    try {
      await addWords({ cycleUuid, words: toAdd }).unwrap();
      toast.success(t('Добавлено слов: {{count}}', { count: toAdd.length }));
      handleClose();
    } catch {
      toast.error(t('Не удалось добавить слова'));
    }
  };

  const content = (
    <VStack max gap="12" className={cls.importBody}>
      <HStack max gap="8" wrap>
        <Select
          value={source}
          onChange={handleSourceChange}
          options={sourceOptions}
          showSearch
          optionFilterProp="label"
          className={cls.field}
        />
        <Input
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined />}
          aria-label={t('Поиск')}
          placeholder={t('Поиск')}
          className={cls.field}
        />
      </HStack>
      <Table<Card>
        rowKey="uuid"
        size="small"
        className={cls.table}
        scroll={TABLE_SCROLL}
        loading={isFetching}
        columns={columns}
        dataSource={visibleCards}
        pagination={{ pageSize: PAGE_SIZE, showSizeChanger: false, hideOnSinglePage: true }}
        rowSelection={{
          selectedRowKeys: selected,
          // preserveSelectedRowKeys: выбор не теряется при поиске и смене страницы.
          preserveSelectedRowKeys: true,
          selections: [Table.SELECTION_ALL, Table.SELECTION_NONE],
          onChange: (keys) => setSelected(keys.map(String)),
          getCheckboxProps: (card) => ({ disabled: existingTerms.has(normalize(card.term)) }),
        }}
      />
    </VStack>
  );

  // Mobile: шторка снизу; на десктопе — прежняя AntD-модалка
  if (isMobile) {
    return (
      <ModalFrame
        open={open}
        width={MODAL_WIDTH}
        title={t('Импорт слов в цикл')}
        onClose={handleClose}
        destroyOnHidden
        actions={(
          <>
            <Button onClick={handleClose}>{t('Отмена')}</Button>
            <Button type="primary" disabled={!selected.length} loading={isLoading} onClick={handleOk}>
              <BlueprintMarks />
              {t('Добавить ({{count}})', { count: selected.length })}
            </Button>
          </>
        )}
      >
        {content}
      </ModalFrame>
    );
  }

  return (
    <Modal
      {...MODAL_MOTION}
      open={open}
      title={t('Импорт слов в цикл')}
      okText={t('Добавить ({{count}})', { count: selected.length })}
      cancelText={t('Отмена')}
      okButtonProps={{ disabled: !selected.length }}
      confirmLoading={isLoading}
      onOk={handleOk}
      onCancel={handleClose}
      width={MODAL_WIDTH}
      destroyOnHidden
    >
      {content}
    </Modal>
  );
};
