import { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button, Card, Dropdown, Empty,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ReadOutlined,
  BulbOutlined,
  StarFilled,
} from '@ant-design/icons';
import {
  Deck,
  useGetDecksQuery,
  useDeleteDeckMutation,
} from '@/entities/Deck';
import {
  useGetCardsQuery,
  useDeleteCardsByDeckMutation,
  useGetFavoritesQuery,
} from '@/entities/Card';
import { DeckForm } from '@/features/DeckForm';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import cls from './DeckList.module.scss';

export const DeckList: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { modal, message } = useAntdApp();

  const { data: decks, isLoading } = useGetDecksQuery();
  const { data: allCards } = useGetCardsQuery();
  const { data: favorites } = useGetFavoritesQuery();
  const [deleteDeck] = useDeleteDeckMutation();

  const favCount = favorites?.length ?? 0;
  const [deleteCardsByDeck] = useDeleteCardsByDeckMutation();

  const [editingDeck, setEditingDeck] = useState<Deck | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);

  const countByDeck = useMemo(() => {
    const map: Record<string, number> = {};
    allCards?.forEach((card) => {
      map[card.deck_uuid] = (map[card.deck_uuid] ?? 0) + 1;
    });
    return map;
  }, [allCards]);

  const handleDelete = (deck: Deck) => {
    modal.confirm({
      title: t('Удалить колоду «{{name}}»?', { name: deck.name }),
      content: t('Все слова этой колоды также будут удалены.'),
      okText: t('Удалить'),
      okButtonProps: { danger: true },
      cancelText: t('Отмена'),
      onOk: async () => {
        await deleteDeck(deck.uuid).unwrap();
        await deleteCardsByDeck(deck.uuid).unwrap();
        message.success(t('Колода удалена'));
      },
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!decks?.length) {
    return <Empty description={t('Пока нет ни одной колоды')} />;
  }

  return (
    <>
      <div className={cls.grid}>
        <Card
          variant="borderless"
          className={`${cls.card} ${cls.favoriteCard}`}
          onClick={() => navigate(RoutePath.FAVORITES())}
        >
          <VStack max gap="12" justify="between" className={cls.cardInner}>
            <VStack max gap="4">
              <HStack gap="8" align="center">
                <StarFilled className={cls.favStar} />
                <MyTypography.Large strong>{t('Избранное')}</MyTypography.Large>
              </HStack>
              <span className={cls.countBadge}>
                {t('{{count}} слов', { count: favCount })}
              </span>
            </VStack>

            <HStack max gap="8" wrap>
              <Button
                icon={<ReadOutlined />}
                disabled={favCount === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(RoutePath.FAVORITES_FLASHCARDS());
                }}
              >
                {t('Карточки')}
              </Button>
              <Button
                type="primary"
                icon={<BulbOutlined />}
                disabled={favCount === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(RoutePath.FAVORITES_LEARN());
                }}
              >
                {t('Заучивание')}
              </Button>
            </HStack>
          </VStack>
        </Card>

        {decks.map((deck) => (
          <Card
            key={deck.uuid}
            variant="borderless"
            className={cls.card}
            onClick={() => navigate(RoutePath.DECK(deck.uuid))}
          >
            <VStack max gap="12" justify="between" className={cls.cardInner}>
              <VStack max gap="4">
                <HStack max justify="between" align="start" gap="8">
                  <MyTypography.Large strong>{deck.name}</MyTypography.Large>
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items: [
                        {
                          key: 'edit',
                          icon: <EditOutlined />,
                          label: t('Редактировать'),
                          onClick: ({ domEvent }) => {
                            domEvent.stopPropagation();
                            setEditingDeck(deck);
                            setFormOpen(true);
                          },
                        },
                        {
                          key: 'delete',
                          icon: <DeleteOutlined />,
                          label: t('Удалить'),
                          danger: true,
                          onClick: ({ domEvent }) => {
                            domEvent.stopPropagation();
                            handleDelete(deck);
                          },
                        },
                      ],
                    }}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                </HStack>
                {deck.description && (
                  <MyTypography.Base type="secondary">{deck.description}</MyTypography.Base>
                )}
                <span className={cls.countBadge}>
                  {t('{{count}} слов', { count: countByDeck[deck.uuid] ?? 0 })}
                </span>
              </VStack>

              <HStack max gap="8" wrap>
                <Button
                  icon={<ReadOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(RoutePath.FLASHCARDS(deck.uuid));
                  }}
                >
                  {t('Карточки')}
                </Button>
                <Button
                  type="primary"
                  icon={<BulbOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(RoutePath.LEARN(deck.uuid));
                  }}
                >
                  {t('Заучивание')}
                </Button>
              </HStack>
            </VStack>
          </Card>
        ))}
      </div>

      <DeckForm
        open={formOpen}
        deck={editingDeck}
        onClose={() => {
          setFormOpen(false);
          setEditingDeck(undefined);
        }}
      />
    </>
  );
};
