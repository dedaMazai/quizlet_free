import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetDeckQuery } from '@/entities/Deck';
import { useGetCardsQuery } from '@/entities/Card';
import { LearnSession } from '@/features/LearnSession';
import { PageLoader } from '@/widgets/PageLoader';
import { SessionResult } from '@/widgets/SessionResult';
import { RoutePath } from '@/shared/config/router/routePath';
import { useSessionCardFilter } from '@/shared/lib/session';

const LearnPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deckId } = useParams();

  const { data: deck } = useGetDeckQuery(deckId!, { skip: !deckId });
  const { data: deckCards, isLoading } = useGetCardsQuery(deckId ?? undefined, { skip: !deckId });
  // «Повторить трудные» запускает сессию по части карточек
  const { cards, sessionKey } = useSessionCardFilter(deckCards);

  if (!deckId) return null;
  // !cards ловит смену deckId без кэша: isLoading уже false, а данных ещё нет.
  if (isLoading || !cards) return <PageLoader />;

  return (
    <LearnSession
      key={sessionKey}
      cards={cards}
      deckKey={deckId}
      deckName={deck?.name ?? ''}
      reviewsDeckUuid={deckId}
      title={deck ? `${deck.name} · ${t('Заучивание')}` : t('Заучивание')}
      onExit={() => navigate(RoutePath.DECK(deckId))}
      renderResult={(summary, restart) => (
        <SessionResult
          summary={summary}
          words={cards}
          onRestart={restart}
          deckId={deckId}
          deckName={deck?.name}
        />
      )}
    />
  );
};

export default LearnPage;
