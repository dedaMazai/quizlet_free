import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Empty, Input, MenuProps, Tag } from 'antd';
import {
  PlusOutlined,
  ReadOutlined,
  BulbOutlined,
  ShareAltOutlined,
  CopyOutlined,
  UserDeleteOutlined,
  DiffOutlined,
  ExportOutlined,
  MoreOutlined,
  RobotOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  useGetDeckQuery,
  useDuplicateDeckMutation,
  useRemoveDeckShareMutation,
} from '@/entities/Deck';
import { useUserInfo } from '@/entities/User';
import { useGetCardsQuery, findDuplicateGroups } from '@/entities/Card';
import { CardList } from '@/widgets/CardList';
import { CardEditor } from '@/features/CardEditor';
import { ShareDeckModal } from '@/features/ShareDeck';
import { DuplicateCardsModal } from '@/features/DuplicateCardsModal';
import { CheckTranslationsModal } from '@/features/CheckTranslationsAI';
import { useDeckExport, ExportFormat } from '@/features/ExportDeck';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
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

  const { data: deck, isLoading } = useGetDeckQuery(deckId!, { skip: !deckId });
  const [duplicateDeck, { isLoading: isDuplicating }] = useDuplicateDeckMutation();
  const [removeShare, { isLoading: isLeaving }] = useRemoveDeckShareMutation();
  const { data: cards } = useGetCardsQuery(deckId!, { skip: !deckId });
  const dupCount = useMemo(() => findDuplicateGroups(cards ?? []).length, [cards]);

  const [search, debouncedSearch, , setSearchDebounced] = useDebounceState('');
  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return cards ?? [];
    return (cards ?? []).filter((card) => card.term.toLowerCase().includes(query)
      || card.translation.toLowerCase().includes(query)
      || (card.example?.toLowerCase().includes(query) ?? false));
  }, [cards, debouncedSearch]);
  const hasSearch = Boolean(debouncedSearch.trim());
  const { exportDeck, exporting, disabled: exportDisabled } = useDeckExport(
    deckId ?? '',
    deck?.name ?? '',
  );

  if (!deckId) return null;
  if (isLoading) return <Loader />;
  if (!deck) return <Empty description={t('Колода не найдена')} />;

  const isOwner = deck.is_owner;
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
  const moreItems: MenuProps['items'] = [
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
      ? { key: 'ai-check', icon: <RobotOutlined />, label: t('Проверить через ИИ') }
      : null,
    isOwner
      ? { key: 'share', icon: <ShareAltOutlined />, label: t('Поделиться') }
      : null,
    isOwner && dupCount > 0
      ? { key: 'dedup', icon: <DiffOutlined />, label: t('Дубли ({{count}})', { count: dupCount }) }
      : null,
    !isOwner
      ? { key: 'duplicate', icon: <CopyOutlined />, label: t('Дублировать') }
      : null,
    !isOwner
      ? { key: 'leave', icon: <UserDeleteOutlined />, label: t('Убрать из своих') }
      : null,
  ].filter(Boolean);

  const handleMoreClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('export:')) {
      exportDeck(key.split(':')[1] as ExportFormat);
      return;
    }
    if (key === 'ai-check') setAiOpen(true);
    if (key === 'share') setShareOpen(true);
    if (key === 'dedup') setDupOpen(true);
    if (key === 'duplicate') handleDuplicate();
    if (key === 'leave') handleLeave();
  };

  return (
    <VStack max fullHeight gap="16">
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
        {isOwner && (
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
        readOnly={!isOwner}
        cards={filtered}
        emptyText={hasSearch ? t('Ничего не найдено') : undefined}
      />

      {isOwner && (
        <>
          <CardEditor open={formOpen} deckUuid={deckId} onClose={() => setFormOpen(false)} />
          <ShareDeckModal open={shareOpen} deckUuid={deckId} onClose={() => setShareOpen(false)} />
          <DuplicateCardsModal open={dupOpen} deckUuid={deckId} onClose={() => setDupOpen(false)} />
          <CheckTranslationsModal open={aiOpen} deckUuid={deckId} onClose={() => setAiOpen(false)} />
        </>
      )}
    </VStack>
  );
};

export default DeckPage;
