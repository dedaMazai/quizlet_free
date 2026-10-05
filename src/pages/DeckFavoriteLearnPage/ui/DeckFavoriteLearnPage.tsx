import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Empty } from 'antd';
import { useGetDeckQuery } from '@/entities/Deck';
import {
  useGetCardsQuery,
  useGetFavoritesQuery,
  getDeckFavoritesProgressKey,
} from '@/entities/Card';
import { LearnSession } from '@/features/LearnSession';
import { PageLoader } from '@/widgets/PageLoader';
import { SessionResult } from '@/widgets/SessionResult';
import { SessionStage } from '@/shared/ui/SessionStage';
import { SessionTopBar } from '@/shared/ui/SessionTopBar';
import { RoutePath } from '@/shared/config/router/routePath';
import { buildSessionTicks, useSessionCardFilter } from '@/shared/lib/session';

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
  const { cards: sessionCards, sessionKey } = useSessionCardFilter(favCards);

  if (!deckId) return null;
  // !cards ловит смену deckId без кэша: isLoading уже false, а данных ещё нет.
  if (isLoading || isDeckLoading || !cards) return <PageLoader />;
  if (!deck) {
    return (
      <>
        <SessionTopBar
          title={t('Заучивание избранного')}
          counter=""
          ticks={buildSessionTicks([], false)}
          onExit={() => navigate(RoutePath.DECKS())}
        />
        <SessionStage>
          <Empty description={t('Колода не найдена')} />
        </SessionStage>
      </>
    );
  }

  return (
    <LearnSession
      key={sessionKey}
      cards={sessionCards ?? favCards}
      deckKey={getDeckFavoritesProgressKey(deckId)}
      deckName={deck.name}
      reviewsDeckUuid={deckId}
      title={`${deck.name} · ${t('Заучивание избранного')}`}
      onExit={() => navigate(RoutePath.DECK(deckId))}
      renderResult={(summary, restart) => (
        <SessionResult
          summary={summary}
          words={sessionCards ?? favCards}
          onRestart={restart}
          deckId={deckId}
          deckName={deck.name}
        />
      )}
    />
  );
};

export default DeckFavoriteLearnPage;
