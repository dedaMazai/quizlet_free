import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCardsQuery, useGetFavoritesQuery } from '@/entities/Card';
import { FlashcardsGame } from '@/features/FlashcardsGame';
import { PageLoader } from '@/widgets/PageLoader';
import { RoutePath } from '@/shared/config/router/routePath';

const FavoriteFlashcardsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: cards, isLoading } = useGetCardsQuery();
  const { data: favorites } = useGetFavoritesQuery();

  const favCards = useMemo(
    () => (cards ?? []).filter((card) => favorites?.includes(card.uuid)),
    [cards, favorites],
  );

  if (isLoading) return <PageLoader />;

  return (
    <FlashcardsGame
      cards={favCards}
      withFavoriteFilter={false}
      title={`${t('Избранное')} · ${t('Карточки')}`}
      onExit={() => navigate(RoutePath.FAVORITES())}
      learnPath={RoutePath.FAVORITES_LEARN()}
    />
  );
};

export default FavoriteFlashcardsPage;
