import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Card,
  useGetCardsQuery,
  useDeleteCardMutation,
} from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { CardForm } from '@/features/CardForm';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack } from '@/shared/ui/Stack';
import { Loader } from '@/shared/ui/Loader';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';

interface CardListProps {
  /** Если задан — показываются слова только этой колоды, иначе все слова. */
  deckUuid?: string;
}

export const CardList: FC<CardListProps> = (props) => {
  const { deckUuid } = props;
  const { t } = useTranslation();
  const { modal, message } = useAntdApp();

  const { data: cards, isLoading } = useGetCardsQuery(deckUuid ?? undefined);
  const { data: decks } = useGetDecksQuery(undefined, { skip: Boolean(deckUuid) });
  const [deleteCard] = useDeleteCardMutation();

  const [editingCard, setEditingCard] = useState<Card | undefined>(undefined);

  const deckNameByUuid = useMemo(() => {
    const map: Record<string, string> = {};
    decks?.forEach((deck) => {
      map[deck.uuid] = deck.name;
    });
    return map;
  }, [decks]);

  const handleDelete = (card: Card) => {
    modal.confirm({
      title: t('Удалить слово «{{term}}»?', { term: card.term }),
      okText: t('Удалить'),
      okButtonProps: { danger: true },
      cancelText: t('Отмена'),
      onOk: async () => {
        await deleteCard(card.uuid).unwrap();
        message.success(t('Слово удалено'));
      },
    });
  };

  const columns: ColumnsType<Card> = [
    {
      title: t('Слово'),
      dataIndex: 'term',
      key: 'term',
      render: (term: string) => (
        <HStack gap="8" align="center">
          <span>{term}</span>
          <SpeakButton text={term} />
        </HStack>
      ),
    },
    {
      title: t('Перевод'),
      dataIndex: 'translation',
      key: 'translation',
    },
    ...(deckUuid
      ? []
      : [
          {
            title: t('Колода'),
            dataIndex: 'deck_uuid',
            key: 'deck_uuid',
            render: (uuid: string) => deckNameByUuid[uuid] ?? '—',
          } as ColumnsType<Card>[number],
        ]),
    {
      title: '',
      key: 'actions',
      width: 96,
      render: (_, card) => (
        <HStack gap="4" justify="end">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditingCard(card)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(card)}
          />
        </HStack>
      ),
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (!cards?.length) {
    return <Empty description={t('Пока нет слов')} />;
  }

  return (
    <>
      <Table
        rowKey="uuid"
        dataSource={cards}
        columns={columns}
        pagination={cards.length > 20 ? { pageSize: 20 } : false}
        size="middle"
      />
      <CardForm
        open={Boolean(editingCard)}
        deckUuid={editingCard?.deck_uuid ?? ''}
        card={editingCard}
        onClose={() => setEditingCard(undefined)}
      />
    </>
  );
};
