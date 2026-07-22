import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useGetDeckQuery } from '@/entities/Deck';
import {
  useGetCardsQuery,
  useGetFavoritesQuery,
  getDeckFavoritesProgressKey,
} from '@/entities/Card';
import { LearnSession } from '@/features/LearnSession';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';

const DeckFavoriteLearnPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deckId } = useParams();

  const { data: deck, isLoading: isDeckLoading } = useGetDeckQuery(deckId!, { skip: !deckId });
  const { data: cards, isLoading } = useGetCardsQuery(deckId!, { skip: !deckId });
  const { data: favorites } = useGetFavoritesQuery();

  const favCards = useMemo(
    () => (cards ?? []).filter((card) => favorites?.includes(card.uuid)),
    [cards, favorites],
  );

  if (!deckId) return null;
  if (isLoading || isDeckLoading) return <Loader />;
  if (!deck) return <Empty description={t('Колода не найдена')} />;

  return (
    <VStack max fullHeight gap="24">
      <HStack gap="8" align="center">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(RoutePath.DECK(deckId))}
        />
        <MyTypography.Large strong>
          {t('Заучивание избранного')}: {deck.name}
        </MyTypography.Large>
      </HStack>
      <LearnSession
        cards={favCards}
        progressKey={getDeckFavoritesProgressKey(deckId)}
        deckName={deck.name}
      />
    </VStack>
  );
};

export default DeckFavoriteLearnPage;
