import {
  FC, MouseEvent, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Empty, Pagination, Tag,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Pencil, Star, Trash2, Volume2 } from 'lucide-react';
import {
  Card,
  CardStatus,
  DueCard,
  dueStatusOf,
  statusOf,
  useDeleteCardMutation,
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
  FavoriteToggle,
} from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { CardForm } from '@/features/CardForm';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './CardList.module.scss';

/** Строк на странице, когда список пагинируется на клиенте. */
const CLIENT_PAGE_SIZE = 50;
const ICON_SIZE = 16;
const ICON_STROKE = 1.5;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Серверная пагинация: список в items — одна страница из total строк. */
interface CardListPagination {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

interface CardListProps {
  /** Если задан — слова одной колоды: колонка «Пример», статус «Повторить». Иначе — «Колода» и «Показ». */
  deckUuid?: string;
  /** Слова с состоянием повторения (при серверной пагинации — текущая страница). */
  items?: DueCard[];
  /** Серверная пагинация; без неё список пагинируется на клиенте. */
  pagination?: CardListPagination;
  loading?: boolean;
  /** Текст пустого состояния (например, «Ничего не найдено» при поиске). */
  emptyText?: string;
  /** Если true — без редактирования/удаления (чужая, расшаренная колода). */
  readOnly?: boolean;
}


/** Целых дней от сегодня до даты показа (по локальному календарю). */
const daysUntil = (dueAt: string): number => {
  const due = new Date(dueAt);
  const today = new Date();
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((dueDay - todayDay) / DAY_MS);
};

const FavoriteStar: FC<{ cardUuid: string }> = ({ cardUuid }) => {
  const { t } = useTranslation();
  const { data: favorites } = useGetFavoritesQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const isFavorite = Boolean(favorites?.includes(cardUuid));
  const label = isFavorite ? t('Убрать из избранного') : t('Добавить в избранное');

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(cardUuid);
  };

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
      className={classNames(cls.iconButton, [], { [cls.starActive]: isFavorite })}
      onClick={handleClick}
    >
      <Star aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
    </button>
  );
};

export const CardList: FC<CardListProps> = (props) => {
  const {
    deckUuid, items, pagination, loading, emptyText, readOnly,
  } = props;
  const { t } = useTranslation();
  const { modal, message } = useAntdApp();
  const { isMobile } = useMatchMedia();
  const isLibrary = !deckUuid;

  const { data: decks } = useGetDecksQuery(undefined, { skip: !isLibrary });
  const [deleteCard] = useDeleteCardMutation();

  const [editingCard, setEditingCard] = useState<Card | undefined>(undefined);
  const [clientPage, setClientPage] = useState(1);

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

  if (loading) {
    return <Loader />;
  }

  if (!items?.length) {
    return <Empty description={emptyText ?? t('Пока нет слов')} />;
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
          {items.map(({ card }) => (
            <div key={card.uuid} className={cls.cardItem}>
              <HStack max justify="between" align="start" gap="8">
                <VStack gap="2" align="start" className={cls.cardMain}>
                  <HStack gap="4" align="center">
                    <span className={cls.mobileTerm}>{card.term}</span>
                    <SpeakButton text={card.term} />
                    {card.card_type === 'phrase' && (
                      <Tag bordered={false}>{t('Фраза')}</Tag>
                    )}
                  </HStack>
                  <MyTypography.Base>{card.translation}</MyTypography.Base>
                  {card.example && (
                    <MyTypography.Small type="secondary" className={cls.mobileExample}>
                      {card.example}
                    </MyTypography.Small>
                  )}
                  {isLibrary && (
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
          {pagination && pagination.total > pagination.pageSize && (
            <HStack max justify="center">
              <Pagination
                simple
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={pagination.onChange}
              />
            </HStack>
          )}
        </VStack>
        {editor}
      </>
    );
  }

  // Без серверной пагинации длинный список режем на страницы на клиенте.
  const pager = pagination ?? (items.length > CLIENT_PAGE_SIZE
    ? {
      current: clientPage,
      pageSize: CLIENT_PAGE_SIZE,
      total: items.length,
      onChange: (page: number) => setClientPage(page),
    }
    : undefined);
  const visibleItems = !pagination && pager
    ? items.slice((pager.current - 1) * pager.pageSize, pager.current * pager.pageSize)
    : items;
  const now = new Date();
  const statusLabels: Record<CardStatus, string> = {
    mastered: t('Усвоено'),
    learning: t('Изучаю'),
    new: t('Новое'),
    due: t('Повторить'),
  };

  const renderNextShow = (dueAt: string | undefined) => {
    if (!dueAt) return <span className={cls.next}>—</span>;
    const days = daysUntil(dueAt);
    if (days <= 0) return <span className={classNames(cls.next, [cls.nextToday])}>{t('Сегодня')}</span>;
    if (days === 1) return <span className={cls.next}>{t('Завтра')}</span>;
    return <span className={cls.next}>{t('Через {{count}} дн', { count: days })}</span>;
  };

  return (
    <>
      <div className={classNames(cls.CardList, [isLibrary ? cls.library : cls.deck])}>
        <div className={classNames(cls.row, [cls.head])}>
          <span />
          <span>{t('Слово')}</span>
          <span>{t('Перевод')}</span>
          <span>{isLibrary ? t('Колода') : t('Пример')}</span>
          <span>{t('Статус')}</span>
          {isLibrary && <span>{t('Показ')}</span>}
          <span />
        </div>
        {visibleItems.map(({ card, review }) => {
          const status = isLibrary ? statusOf(review) : dueStatusOf(review, now);
          return (
            <div
              key={card.uuid}
              className={classNames(cls.row, [cls.item], { [cls.editable]: !readOnly })}
              onClick={readOnly ? undefined : () => setEditingCard(card)}
            >
              <FavoriteStar cardUuid={card.uuid} />
              <span className={cls.termCell}>
                <span className={cls.term}>{card.term}</span>
                {!isLibrary && card.card_type === 'phrase' && (
                  <span className={cls.phraseTag}>{t('Фраза')}</span>
                )}
              </span>
              <span className={cls.ellipsis}>{card.translation}</span>
              {isLibrary
                ? <span className={cls.deckChip}>{deckNameByUuid[card.deck_uuid] ?? '—'}</span>
                : <span className={cls.example}>{card.example}</span>}
              <span className={cls.status}>
                <i className={classNames(cls.statusMark, [cls[status]])} />
                {statusLabels[status]}
              </span>
              {isLibrary && renderNextShow(review?.due_at)}
              <SpeakButton
                className={cls.iconButton}
                text={card.term}
                icon={<Volume2 aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
              />
              {!readOnly && (
                <span className={cls.actions}>
                  <button
                    type="button"
                    aria-label={t('Редактировать')}
                    className={cls.iconButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCard(card);
                    }}
                  >
                    <Pencil aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                  </button>
                  <button
                    type="button"
                    aria-label={t('Удалить')}
                    className={cls.iconButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(card);
                    }}
                  >
                    <Trash2 aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                  </button>
                </span>
              )}
            </div>
          );
        })}
        {pager && pager.total > pager.pageSize && (
          <div className={cls.footer}>
            <span className={cls.range}>
              {t('{{from}}–{{to}} из {{total}}', {
                from: (pager.current - 1) * pager.pageSize + 1,
                to: Math.min(pager.current * pager.pageSize, pager.total),
                total: pager.total,
              })}
            </span>
            <Pagination
              className={cls.pagination}
              current={pager.current}
              pageSize={pager.pageSize}
              total={pager.total}
              showSizeChanger={false}
              onChange={pager.onChange}
            />
          </div>
        )}
      </div>
      {editor}
    </>
  );
};
