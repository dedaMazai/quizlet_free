import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useGetCardsQuery,
  useGetFavoritesQuery,
  useLibraryFilterCards,
  FAVORITES_PROGRESS_KEY,
} from '@/entities/Card';
import { LearnSession } from '@/features/LearnSession';
import { PageLoader } from '@/widgets/PageLoader';
import { SessionResult } from '@/widgets/SessionResult';
import { RoutePath } from '@/shared/config/router/routePath';
import { useSessionCardFilter } from '@/shared/lib/session';

const FavoriteLearnPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
  const { cards: sessionCards, sessionKey } = useSessionCardFilter(selection);

  if (isLoading || isSelectionLoading || !cards || !selection) return <PageLoader />;

  return (
    <LearnSession
      key={sessionKey}
      cards={sessionCards ?? selection}
      deckKey={FAVORITES_PROGRESS_KEY}
      deckName={FAVORITES_PROGRESS_KEY}
      title={`${t('Избранное')} · ${t('Заучивание')}`}
      onExit={() => navigate(RoutePath.FAVORITES())}
      renderResult={(summary, restart) => (
        <SessionResult
          summary={summary}
          words={sessionCards ?? selection}
          onRestart={restart}
        />
      )}
    />
  );
};

export default FavoriteLearnPage;
