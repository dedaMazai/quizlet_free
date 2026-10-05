import { FC, MouseEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Empty } from 'antd';
import type { MenuProps } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  CopyOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { Ellipsis } from 'lucide-react';
import {
  Deck,
  useGetDecksQuery,
  useDeleteDeckMutation,
  useDuplicateDeckMutation,
  useRemoveDeckShareMutation,
} from '@/entities/Deck';
import { useDeleteCardsByDeckMutation } from '@/entities/Card';
import { useGetDueSummaryQuery, useGetMasteryQuery } from '@/entities/Statistics';
import { useUserInfo, useUserAccesses } from '@/entities/User';
import { DeckForm } from '@/features/DeckForm';
import { ShareDeckModal } from '@/features/ShareDeck';
import { Blueprint } from '@/shared/ui/Blueprint';
import { DueBadge } from '@/shared/ui/DueBadge';
import { MasteryBar, MasteryBarSize } from '@/shared/ui/MasteryBar';
import { FadeIn, Skeleton } from '@/shared/ui/Skeleton';
import { RoutePath } from '@/shared/config/router/routePath';
import { Accesses } from '@/shared/types/accesses';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useToast, useUndoableDelete } from '@/shared/lib/toast';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './DeckList.module.scss';

const MENU_ICON_SIZE = 18;
const ICON_STROKE = 1.5;
const PERCENT = 100;
const SKELETON_CARDS = 6;

const toPercent = (part: number, total: number): number => (
  total > 0 ? Math.round((part / total) * PERCENT) : 0
);

interface DeckListProps {
  limit?: number;
  sort?: 'default' | 'recent' | 'name';
  filter?: 'all' | 'own' | 'shared';
  /** Поиск по названию колоды */
  search?: string;
}

export const DeckList: FC<DeckListProps> = (props) => {
  const {
    limit,
    sort = 'default',
    filter = 'all',
    search = '',
  } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { modal } = useAntdApp();
  const toast = useToast();
  const userInfo = useUserInfo();
  const isAdmin = useUserAccesses().includes(Accesses.administration);
  const { isMobile } = useMatchMedia();

  const tz = userInfo?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const { data: decks, isLoading } = useGetDecksQuery();
  const { data: summary } = useGetDueSummaryQuery({ tz });
  const { data: mastery } = useGetMasteryQuery();
  const [deleteDeck] = useDeleteDeckMutation();
  const [duplicateDeck] = useDuplicateDeckMutation();
  const [removeShare] = useRemoveDeckShareMutation();

  const [deleteCardsByDeck] = useDeleteCardsByDeckMutation();

  // Удаление с «Отменить»: колода скрыта сразу, запросы уходят через 6 с
  const { hiddenIds, remove: removeDeck } = useUndoableDelete({
    onCommit: async (uuid) => {
      await deleteDeck(uuid).unwrap();
      await deleteCardsByDeck(uuid).unwrap();
    },
    onError: () => toast.error(t('Не удалось удалить колоду')),
  });

  const [editingDeck, setEditingDeck] = useState<Deck | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [sharingDeckUuid, setSharingDeckUuid] = useState<string | undefined>(undefined);

  const visibleDecks = useMemo(() => {
    let list = (decks ?? []).filter((deck) => !hiddenIds.has(deck.uuid));
    if (filter === 'own') list = list.filter((deck) => deck.is_owner);
    if (filter === 'shared') list = list.filter((deck) => !deck.is_owner);
    const query = search.trim().toLowerCase();
    if (query) list = list.filter((deck) => deck.name.toLowerCase().includes(query));

    if (sort === 'recent') {
      list = [...list].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    } else if (sort === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return typeof limit === 'number' ? list.slice(0, limit) : list;
  }, [decks, hiddenIds, filter, search, sort, limit]);

  const dueByDeck = useMemo(
    () => new Map((summary?.perDeck ?? []).map((deck) => [deck.deckUuid, deck.due])),
    [summary],
  );
  const masteryByDeck = useMemo(
    () => new Map((mastery?.perDeck ?? []).map((deck) => [deck.deckKey, deck])),
    [mastery],
  );

  const handleDelete = (deck: Deck) => {
    modal.confirm({
      title: t('Удалить колоду «{{name}}»?', { name: deck.name }),
      content: t('Все слова этой колоды также будут удалены.'),
      okText: t('Удалить'),
      okButtonProps: { danger: true },
      cancelText: t('Отмена'),
      onOk: () => removeDeck(deck.uuid, t('Колода удалена'), t('Отменить')),
    });
  };

  const handleDuplicate = async (deck: Deck) => {
    try {
      await duplicateDeck(deck).unwrap();
      toast.success(t('Колода скопирована'));
    } catch {
      toast.error(t('Не удалось скопировать колоду'));
    }
  };

  const handleLeave = (deck: Deck) => {
    if (!userInfo) return;
    modal.confirm({
      title: t('Убрать колоду «{{name}}» из своих?', { name: deck.name }),
      content: t('Вы больше не будете её видеть. Автор сможет открыть доступ снова.'),
      okText: t('Убрать из своих'),
      okButtonProps: { danger: true },
      cancelText: t('Отмена'),
      onOk: async () => {
        await removeShare({ deckUuid: deck.uuid, userId: userInfo.uuid }).unwrap();
        toast.success(t('Вы больше не видите эту колоду'));
      },
    });
  };

  const deckMenuItems = (deck: Deck): MenuProps['items'] => {
    const editItem: NonNullable<MenuProps['items']>[number] = {
      key: 'edit',
      icon: <EditOutlined />,
      label: t('Редактировать'),
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setEditingDeck(deck);
        setFormOpen(true);
      },
    };

    if (deck.is_owner) {
      return [
        editItem,
        {
          key: 'share',
          icon: <ShareAltOutlined />,
          label: t('Поделиться'),
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            setSharingDeckUuid(deck.uuid);
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
      ];
    }

    return [
      // Админ может редактировать расшаренную с ним колоду (без удаления и шаринга).
      ...(isAdmin ? [editItem] : []),
      {
        key: 'duplicate',
        icon: <CopyOutlined />,
        label: t('Дублировать'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          handleDuplicate(deck);
        },
      },
      {
        key: 'leave',
        icon: <UserDeleteOutlined />,
        label: t('Убрать из своих'),
        danger: true,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          handleLeave(deck);
        },
      },
    ];
  };

  if (isLoading) {
    // Скелетон: та же сетка и размеры карточек
    return (
      <div className={cls.grid}>
        {Array.from({ length: SKELETON_CARDS }, (_, i) => (
          <Blueprint key={i} className={isMobile ? cls.mobileSkeletonCard : cls.skeletonCard}>
            <Skeleton className={isMobile ? cls.mobileNameSkeleton : cls.nameSkeleton} />
            <Skeleton className={cls.lineSkeleton} />
          </Blueprint>
        ))}
      </div>
    );
  }

  if (!visibleDecks.length) {
    return (
      <Empty
        description={search.trim() ? t('Ничего не найдено') : t('Пока нет ни одной колоды')}
      />
    );
  }

  return (
    <>
      <FadeIn className={cls.grid}>
        {visibleDecks.map((deck) => {
          const deckMastery = masteryByDeck.get(deck.uuid);
          const mastered = toPercent(deckMastery?.mastered ?? 0, deck.cards_count);
          const learning = toPercent(deckMastery?.learning ?? 0, deck.cards_count);
          const due = dueByDeck.get(deck.uuid) ?? 0;
          const author = deck.is_owner ? undefined : deck.owner_name ?? deck.owner_email;

          const menu = (
            <Dropdown
              trigger={['click']}
              menu={{ items: deckMenuItems(deck) }}
            >
              <Button
                type="text"
                size="small"
                className={isMobile ? cls.mobileMenuButton : cls.menuButton}
                aria-label={t('Ещё')}
                icon={<Ellipsis size={MENU_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                onClick={(e: MouseEvent) => e.stopPropagation()}
              />
            </Dropdown>
          );

          // Mobile 6.38: название + бейдж, полоса освоения + число слов.
          // «…» сверх макета: иначе колоду на мобильном не изменить и не удалить
          if (isMobile) {
            return (
              <Blueprint
                key={deck.uuid}
                className={cls.mobileCard}
                onClick={() => navigate(RoutePath.DECK(deck.uuid))}
              >
                <span className={cls.mobileHead}>
                  <span className={cls.mobileName}>{deck.name}</span>
                  {due > 0 && <DueBadge count={due} />}
                  {menu}
                </span>
                <span className={cls.mobileProgress}>
                  <MasteryBar
                    className={cls.mobileBar}
                    mastered={mastered}
                    learning={learning}
                    size={MasteryBarSize.SM}
                  />
                  <span className={cls.mobileCount}>
                    {t('{{count}} слов', { count: deck.cards_count })}
                  </span>
                </span>
              </Blueprint>
            );
          }

          return (
            <Blueprint
              key={deck.uuid}
              className={cls.card}
              onClick={() => navigate(RoutePath.DECK(deck.uuid))}
            >
              <div className={cls.head}>
                <div className={cls.titleBlock}>
                  <span className={cls.name}>{deck.name}</span>
                  {deck.description && (
                    <span className={cls.description}>{deck.description}</span>
                  )}
                </div>
                {menu}
              </div>
              {(due > 0 || author) && (
                <div className={cls.tags}>
                  {due > 0 && <DueBadge count={due} />}
                  {author && (
                    <span className={cls.author}>{t('от {{author}}', { author })}</span>
                  )}
                </div>
              )}
              <div className={cls.progress}>
                <MasteryBar mastered={mastered} learning={learning} size={MasteryBarSize.SM} />
                <div className={cls.stats}>
                  <span>{t('{{count}} слов', { count: deck.cards_count })}</span>
                  <span>{t('{{percent}}% усвоено', { percent: mastered })}</span>
                </div>
              </div>
            </Blueprint>
          );
        })}
      </FadeIn>

      <DeckForm
        open={formOpen}
        deck={editingDeck}
        onClose={() => {
          setFormOpen(false);
          setEditingDeck(undefined);
        }}
      />

      {sharingDeckUuid && (
        <ShareDeckModal
          open={Boolean(sharingDeckUuid)}
          deckUuid={sharingDeckUuid}
          onClose={() => setSharingDeckUuid(undefined)}
        />
      )}
    </>
  );
};
