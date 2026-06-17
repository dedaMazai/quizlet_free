import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Empty } from 'antd';
import {
  PlusOutlined, ReadOutlined, BulbOutlined,
} from '@ant-design/icons';
import { useGetDeckQuery } from '@/entities/Deck';
import { CardList } from '@/widgets/CardList';
import { CardEditor } from '@/features/CardEditor';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';

const DeckPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deckId } = useParams();
  const [formOpen, setFormOpen] = useState(false);

  const { data: deck, isLoading } = useGetDeckQuery(deckId!, { skip: !deckId });

  if (!deckId) return null;
  if (isLoading) return <Loader />;
  if (!deck) return <Empty description={t('Колода не найдена')} />;

  return (
    <VStack max fullHeight gap="16">
      <HStack max justify="between" align="start" gap="16" wrap>
        <VStack gap="4">
          <MyTypography.Large strong>{deck.name}</MyTypography.Large>
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
        </HStack>
      </HStack>

      <HStack max justify="between" align="center">
        <MyTypography.Base strong>{t('Слова')}</MyTypography.Base>
        <Button icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          {t('Добавить слова')}
        </Button>
      </HStack>

      <CardList deckUuid={deckId} />

      <CardEditor open={formOpen} deckUuid={deckId} onClose={() => setFormOpen(false)} />
    </VStack>
  );
};

export default DeckPage;
