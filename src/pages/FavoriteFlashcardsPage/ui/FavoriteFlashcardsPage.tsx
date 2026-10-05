import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCardsQuery, useGetFavoritesQuery, useLibraryFilterCards } from '@/entities/Card';
import { FlashcardsGame } from '@/features/FlashcardsGame';
import { PageLoader } from '@/widgets/PageLoader';
import { RoutePath } from '@/shared/config/router/routePath';

const FavoriteFlashcardsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: cards, isLoading } = useGetCardsQuery();
  const { data: favorites } = useGetFavoritesQuery();

  const favCards = useMemo(
    () => (cards ?? []).filter((card) => favorites?.includes(card.uuid)),
    [cards, favorites],
  );

  // Фильтр выборки «Избранного» из query-параметров
  const { cards: selection, isLoading: isSelectionLoading } = useLibraryFilterCards(favCards, {
    uuids: favorites,
    skip: !favorites,
  });

  if (isLoading || isSelectionLoading) return <PageLoader />;

  return (
    <FlashcardsGame
      cards={selection ?? []}
      withFavoriteFilter={false}
      title={`${t('Избранное')} · ${t('Карточки')}`}
      onExit={() => navigate(RoutePath.FAVORITES())}
      learnPath={`${RoutePath.FAVORITES_LEARN()}${location.search}`}
    />
  );
};

export default FavoriteFlashcardsPage;
