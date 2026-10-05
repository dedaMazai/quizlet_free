import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Empty, Input, MenuProps, Segmented, Tag } from 'antd';
import {
  PlusOutlined,
  ReadOutlined,
  BulbOutlined,
  EditOutlined,
  ShareAltOutlined,
  CopyOutlined,
  UserDeleteOutlined,
  DiffOutlined,
  ExportOutlined,
  MoreOutlined,
  RobotOutlined,
  SearchOutlined,
  StarOutlined,
  FormOutlined,
  BuildOutlined,
} from '@ant-design/icons';
import {
  useGetDeckQuery,
  useDuplicateDeckMutation,
  useRemoveDeckShareMutation,
} from '@/entities/Deck';
import { useUserInfo, useUserAccesses } from '@/entities/User';
import {
  CardType,
  useGetCardsQuery,
  useGetFavoritesQuery,
  findDuplicateGroups,
} from '@/entities/Card';
import { CardList } from '@/widgets/CardList';
import { CardEditor } from '@/features/CardEditor';
import { ShareDeckModal } from '@/features/ShareDeck';
import { DuplicateCardsModal } from '@/features/DuplicateCardsModal';
import { CheckTranslationsModal } from '@/features/CheckTranslationsAI';
import { GenerateChunksModal } from '@/features/GenerateChunksAI';
import { useDeckExport, ExportFormat } from '@/features/ExportDeck';
import { BackLink } from '@/shared/ui/BackLink';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
import { Accesses } from '@/shared/types/accesses';
import { MenuItem } from '@/shared/const/menu';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';
import cls from './DeckPage.module.scss';

const DeckPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = useAntdApp();
  const { deckId } = useParams();
  const userInfo = useUserInfo();
  const [formOpen, setFormOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [chunksOpen, setChunksOpen] = useState(false);

  const { data: deck, isLoading } = useGetDeckQuery(deckId!, { skip: !deckId });
  const [duplicateDeck, { isLoading: isDuplicating }] = useDuplicateDeckMutation();
  const [removeShare, { isLoading: isLeaving }] = useRemoveDeckShareMutation();
  const { data: cards } = useGetCardsQuery(deckId!, { skip: !deckId });
  const { data: favorites } = useGetFavoritesQuery();
  const userAccesses = useUserAccesses();
  const dupCount = useMemo(() => findDuplicateGroups(cards ?? []).length, [cards]);
  const favCount = useMemo(
    () => (cards ?? []).filter((card) => favorites?.includes(card.uuid)).length,
    [cards, favorites],
  );

  const [search, debouncedSearch, , setSearchDebounced] = useDebounceState('');
  const [typeFilter, setTypeFilter] = useState<CardType | 'all'>('all');
  const [favFilter, setFavFilter] = useState<'all' | 'favorite' | 'notFavorite'>('all');
  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const favSet = new Set(favorites ?? []);
    return (cards ?? []).filter((card) => {
      if (typeFilter !== 'all' && card.card_type !== typeFilter) return false;
      if (favFilter !== 'all' && favSet.has(card.uuid) !== (favFilter === 'favorite')) return false;
      if (!query) return true;
      return card.term.toLowerCase().includes(query)
        || card.translation.toLowerCase().includes(query)
        || (card.example?.toLowerCase().includes(query) ?? false);
    });
  }, [cards, debouncedSearch, typeFilter, favFilter, favorites]);
  const hasSearch = Boolean(debouncedSearch.trim());
  const { exportDeck, exporting, disabled: exportDisabled } = useDeckExport(
    deckId ?? '',
    deck?.name ?? '',
  );

  if (!deckId) return null;
  if (isLoading) return <Loader />;
  if (!deck) return <Empty description={t('Колода не найдена')} />;

  const isOwner = deck.is_owner;
  const isAdmin = userAccesses.includes(Accesses.administration);
  // Видимая чужая колода по RLS всегда расшарена с нами: правка слов доступна
  // владельцу, гостю при общем редактировании и админу.
  const canEditCards = isOwner || deck.allow_shared_edit || isAdmin;
  const authorLabel = deck.owner_name ?? deck.owner_email;

  const handleDuplicate = async () => {
    try {
      const copy = await duplicateDeck(deck).unwrap();
      message.success(t('Колода скопирована'));
      navigate(RoutePath.DECK(copy.uuid));
    } catch {
      message.error(t('Не удалось скопировать колоду'));
    }
  };

  const handleLeave = async () => {
    if (!userInfo) return;
    try {
      await removeShare({ deckUuid: deck.uuid, userId: userInfo.uuid }).unwrap();
      message.success(t('Вы больше не видите эту колоду'));
      navigate(RoutePath.DECKS());
    } catch {
      message.error(t('Не удалось убрать колоду'));
    }
  };

  // Второстепенные действия колоды собраны в одно меню «...».
  // Пунктов до десяти, поэтому они разложены по смысловым группам:
  // режимы занятий, работа со словами, действия над самой колодой.
  const moreGroups: { key: string; label: string; items: MenuItem[] }[] = [
    {
      key: 'modes',
      label: t('Режимы'),
      items: [
        {
          key: 'cloze',
          icon: <FormOutlined />,
          label: t('Пропуски'),
          // Режим строится на поле «Пример»: без примеров пропуск делать не из чего.
          disabled: !cards?.some((card) => card.example),
        },
        {
          key: 'order',
          icon: <BuildOutlined />,
          label: t('Собери фразу'),
          // Собирать имеет смысл только фразы: одиночное слово собирать нечего.
          disabled: !cards?.some((card) => card.card_type === 'phrase'),
        },
        {
          key: 'learn-favorites',
          icon: <StarOutlined />,
          label: t('Заучивание избранного'),
          disabled: favCount === 0,
        },
      ].filter(Boolean),
    },
    {
      key: 'words',
      label: t('Слова'),
      items: [
        canEditCards
          ? { key: 'ai-check', icon: <RobotOutlined />, label: t('Проверить через ИИ') }
          : null,
        canEditCards
          ? { key: 'ai-chunks', icon: <RobotOutlined />, label: t('Сгенерировать фразы (ИИ)') }
          : null,
        canEditCards && dupCount > 0
          ? { key: 'dedup', icon: <DiffOutlined />, label: t('Дубли ({{count}})', { count: dupCount }) }
          : null,
      ].filter(Boolean),
    },
    {
      key: 'deck',
      label: t('Колода'),
      items: [
        {
          key: 'export',
          icon: <ExportOutlined />,
          label: t('Экспорт'),
          disabled: exportDisabled,
          children: [
            { key: 'export:excel', label: t('Excel') },
            { key: 'export:json', label: t('JSON') },
            { key: 'export:markdown', label: t('Markdown') },
          ],
        },
        isOwner
          ? { key: 'share', icon: <ShareAltOutlined />, label: t('Поделиться') }
          : null,
        !isOwner
          ? { key: 'duplicate', icon: <CopyOutlined />, label: t('Дублировать') }
          : null,
        !isOwner
          ? { key: 'leave', icon: <UserDeleteOutlined />, label: t('Убрать из своих') }
          : null,
      ].filter(Boolean),
    },
  ];

  // Пустая группа оставила бы висящий заголовок.
  const moreItems: MenuProps['items'] = moreGroups
    .filter((group) => group.items.length > 0)
    .map((group) => ({ key: group.key, type: 'group', label: group.label, children: group.items }));

  const handleMoreClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('export:')) {
      exportDeck(key.split(':')[1] as ExportFormat);
      return;
    }
    if (key === 'cloze') navigate(RoutePath.CLOZE(deckId));
    if (key === 'order') navigate(RoutePath.ORDER(deckId));
    if (key === 'learn-favorites') navigate(RoutePath.DECK_FAVORITES_LEARN(deckId));
    if (key === 'ai-check') setAiOpen(true);
    if (key === 'ai-chunks') setChunksOpen(true);
    if (key === 'share') setShareOpen(true);
    if (key === 'dedup') setDupOpen(true);
    if (key === 'duplicate') handleDuplicate();
    if (key === 'leave') handleLeave();
  };

  return (
    <VStack max fullHeight gap="16">
      <BackLink
        items={[
          { label: t('Библиотека'), to: RoutePath.DECKS() },
          { label: t('Колоды'), to: RoutePath.DECKS() },
        ]}
      />
      <HStack max justify="between" align="start" gap="16" wrap>
        <VStack gap="4">
          <HStack gap="8" align="center" wrap>
            <MyTypography.Large strong>{deck.name}</MyTypography.Large>
            {!isOwner && authorLabel && (
              <Tag bordered={false}>{t('Автор')}: {authorLabel}</Tag>
            )}
          </HStack>
          {deck.description && (
            <MyTypography.Base type="secondary">{deck.description}</MyTypography.Base>
          )}
        </VStack>
        <HStack gap="8" wrap>
          <Button
            icon={<ReadOutlined />}
            onClick={() => navigate(RoutePath.FLASHCARDS(deckId))}
          >
            {t('Карточки')}
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(RoutePath.WRITE(deckId))}
          >
            {t('Письмо')}
          </Button>
          <Button
            type="primary"
            icon={<BulbOutlined />}
            onClick={() => navigate(RoutePath.LEARN(deckId))}
          >
            {t('Заучивание')}
          </Button>
          <Dropdown
            trigger={['click']}
            menu={{ items: moreItems, onClick: handleMoreClick }}
          >
            <Button
              icon={<MoreOutlined />}
              loading={exporting || isDuplicating || isLeaving}
            />
          </Dropdown>
        </HStack>
      </HStack>

      <HStack max align="center" gap="16" wrap>
        <HStack gap="8" align="center">
          <MyTypography.Base strong>{t('Слова')}</MyTypography.Base>
          <MyTypography.Small type="secondary">
            {t('{{count}} слов', { count: cards?.length ?? 0 })}
          </MyTypography.Small>
        </HStack>
        <Input
          className={cls.search}
          prefix={<SearchOutlined />}
          allowClear
          value={search}
          placeholder={t('Поиск слов')}
          onChange={(e) => setSearchDebounced(e.target.value)}
        />
        <Segmented<CardType | 'all'>
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { label: t('Все'), value: 'all' },
            { label: t('Слова'), value: 'word' },
            { label: t('Фразы'), value: 'phrase' },
          ]}
        />
        <Segmented<'all' | 'favorite' | 'notFavorite'>
          value={favFilter}
          onChange={setFavFilter}
          options={[
            { label: t('Все'), value: 'all' },
            { label: t('Избранные'), value: 'favorite' },
            { label: t('Неизбранные'), value: 'notFavorite' },
          ]}
        />
        {canEditCards && (
          <Button
            className={cls.addButton}
            icon={<PlusOutlined />}
            onClick={() => setFormOpen(true)}
          >
            {t('Добавить слова')}
          </Button>
        )}
      </HStack>

      <CardList
        deckUuid={deckId}
        readOnly={!canEditCards}
        cards={filtered}
        emptyText={hasSearch || favFilter !== 'all' ? t('Ничего не найдено') : undefined}
      />

      {canEditCards && (
        <>
          <CardEditor open={formOpen} deckUuid={deckId} onClose={() => setFormOpen(false)} />
          <DuplicateCardsModal open={dupOpen} deckUuid={deckId} onClose={() => setDupOpen(false)} />
          <CheckTranslationsModal open={aiOpen} deckUuid={deckId} onClose={() => setAiOpen(false)} />
          <GenerateChunksModal
            open={chunksOpen}
            deckUuid={deckId}
            onClose={() => setChunksOpen(false)}
          />
        </>
      )}
      {isOwner && (
        <ShareDeckModal open={shareOpen} deckUuid={deckId} onClose={() => setShareOpen(false)} />
      )}
    </VStack>
  );
};

export default DeckPage;
