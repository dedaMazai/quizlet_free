import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Table, Empty, Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Card,
  useGetCardsQuery,
  useDeleteCardMutation,
  useGetFavoritesQuery,
  FavoriteToggle,
} from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { CardForm } from '@/features/CardForm';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './CardList.module.scss';

interface CardListProps {
  /** Если задан — показываются слова только этой колоды, иначе все слова. */
  deckUuid?: string;
  /** Если true — показываются только избранные слова (из всех колод). */
  favoritesOnly?: boolean;
  /** Явный список слов (переопределяет загрузку — для фильтрации на стороне страницы). */
  cards?: Card[];
  /** Текст пустого состояния (например, «Ничего не найдено» при поиске). */
  emptyText?: string;
  /** Если true — скрыть кнопки редактирования/удаления (чужая, расшаренная колода). */
  readOnly?: boolean;
}

export const CardList: FC<CardListProps> = (props) => {
  const {
    deckUuid, favoritesOnly, cards: cardsProp, emptyText, readOnly,
  } = props;
  const { t } = useTranslation();
  const { modal, message } = useAntdApp();
  const { isMobile } = useMatchMedia();

  const { data: allCards, isLoading } = useGetCardsQuery(deckUuid ?? undefined, {
    skip: Boolean(cardsProp),
  });
  const { data: favorites } = useGetFavoritesQuery(undefined, { skip: !favoritesOnly });
  const { data: decks } = useGetDecksQuery(undefined, { skip: Boolean(deckUuid) });
  const [deleteCard] = useDeleteCardMutation();

  const cards = useMemo(() => {
    if (cardsProp) {
      return cardsProp;
    }
    return favoritesOnly
      ? (allCards ?? []).filter((card) => favorites?.includes(card.uuid))
      : allCards;
  }, [cardsProp, allCards, favorites, favoritesOnly]);

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
      key: 'term',
      render: (_, card) => (
        <VStack gap="2">
          <HStack gap="8" align="center">
            <span className={cls.term}>{card.term}</span>
            <SpeakButton text={card.term} />
          </HStack>
          {card.example && (
            <MyTypography.Small type="secondary" className={cls.example}>
              {card.example}
            </MyTypography.Small>
          )}
        </VStack>
      ),
    },
    {
      title: t('Перевод'),
      dataIndex: 'translation',
      key: 'translation',
    },
    {
      title: '',
      key: 'favorite',
      width: 56,
      render: (_, card) => <FavoriteToggle cardUuid={card.uuid} />,
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
    ...(readOnly
      ? []
      : [
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
          } as ColumnsType<Card>[number],
        ]),
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (!cards?.length) {
    const description = emptyText
      ?? (favoritesOnly ? t('В избранном пока нет слов') : t('Пока нет слов'));
    return <Empty description={description} />;
  }

  const editor = readOnly ? null : (
    <CardForm
      open={Boolean(editingCard)}
      deckUuid={editingCard?.deck_uuid ?? ''}
      card={editingCard}
      onClose={() => setEditingCard(undefined)}
    />
  );

  if (isMobile) {
    return (
      <>
        <VStack max gap="8">
          {cards.map((card) => (
            <div key={card.uuid} className={cls.cardItem}>
              <HStack max justify="between" align="start" gap="8">
                <VStack gap="2" align="start" className={cls.cardMain}>
                  <HStack gap="4" align="center">
                    <span className={cls.term}>{card.term}</span>
                    <SpeakButton text={card.term} />
                  </HStack>
                  <MyTypography.Base>{card.translation}</MyTypography.Base>
                  {card.example && (
                    <MyTypography.Small type="secondary" className={cls.example}>
                      {card.example}
                    </MyTypography.Small>
                  )}
                  {!deckUuid && (
                    <Tag className={cls.deckTag} bordered={false}>
                      {deckNameByUuid[card.deck_uuid] ?? '—'}
                    </Tag>
                  )}
                </VStack>
                <HStack gap="2" align="center">
                  <FavoriteToggle cardUuid={card.uuid} />
                  {!readOnly && (
                    <>
                      <Button
                        type="text"
                        size="small"
                        aria-label={t('Редактировать')}
                        icon={<EditOutlined />}
                        onClick={() => setEditingCard(card)}
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        aria-label={t('Удалить')}
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(card)}
                      />
                    </>
                  )}
                </HStack>
              </HStack>
            </div>
          ))}
        </VStack>
        {editor}
      </>
    );
  }

  return (
    <>
      <div className={cls.panel}>
        <Table
          rowKey="uuid"
          dataSource={cards}
          columns={columns}
          pagination={
            cards.length > 20
              ? {
                  defaultPageSize: 20,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50, 100],
                }
              : false
          }
          size="middle"
        />
      </div>
      {editor}
    </>
  );
};
