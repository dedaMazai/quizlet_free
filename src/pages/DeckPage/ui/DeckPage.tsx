import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Tag } from 'antd';
import {
  PlusOutlined,
  ReadOutlined,
  BulbOutlined,
  ShareAltOutlined,
  CopyOutlined,
  UserDeleteOutlined,
  DiffOutlined,
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
import { ExportDeckButton } from '@/features/ExportDeck';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';

const DeckPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = useAntdApp();
  const { deckId } = useParams();
  const userInfo = useUserInfo();
  const [formOpen, setFormOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);

  const { data: deck, isLoading } = useGetDeckQuery(deckId!, { skip: !deckId });
  const [duplicateDeck, { isLoading: isDuplicating }] = useDuplicateDeckMutation();
  const [removeShare, { isLoading: isLeaving }] = useRemoveDeckShareMutation();
  const { data: cards } = useGetCardsQuery(deckId!, { skip: !deckId });
  const dupCount = useMemo(() => findDuplicateGroups(cards ?? []).length, [cards]);

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
          <ExportDeckButton deckUuid={deckId} deckName={deck.name} />
          {isOwner ? (
            <Button icon={<ShareAltOutlined />} onClick={() => setShareOpen(true)}>
              {t('Поделиться')}
            </Button>
          ) : (
            <>
              <Button
                icon={<CopyOutlined />}
                loading={isDuplicating}
                onClick={handleDuplicate}
              >
                {t('Дублировать')}
              </Button>
              <Button
                icon={<UserDeleteOutlined />}
                loading={isLeaving}
                onClick={handleLeave}
              >
                {t('Убрать из своих')}
              </Button>
            </>
          )}
        </HStack>
      </HStack>

      <HStack max justify="between" align="center">
        <MyTypography.Base strong>{t('Слова')}</MyTypography.Base>
        {isOwner && (
          <HStack gap="8" wrap>
            {dupCount > 0 && (
              <Button icon={<DiffOutlined />} onClick={() => setDupOpen(true)}>
                {t('Дубли ({{count}})', { count: dupCount })}
              </Button>
            )}
            <Button icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
              {t('Добавить слова')}
            </Button>
          </HStack>
        )}
      </HStack>

      <CardList deckUuid={deckId} readOnly={!isOwner} />

      {isOwner && (
        <>
          <CardEditor open={formOpen} deckUuid={deckId} onClose={() => setFormOpen(false)} />
          <ShareDeckModal open={shareOpen} deckUuid={deckId} onClose={() => setShareOpen(false)} />
          <DuplicateCardsModal open={dupOpen} deckUuid={deckId} onClose={() => setDupOpen(false)} />
        </>
      )}
    </VStack>
  );
};

export default DeckPage;
