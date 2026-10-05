import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetDeckQuery } from '@/entities/Deck';
import { useGetCardsQuery } from '@/entities/Card';
import { OrderSession } from '@/features/OrderSession';
import { PageLoader } from '@/widgets/PageLoader';
import { SessionResult } from '@/widgets/SessionResult';
import { RoutePath } from '@/shared/config/router/routePath';
import { useSessionCardFilter } from '@/shared/lib/session';

const OrderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deckId } = useParams();

  const { data: deck } = useGetDeckQuery(deckId!, { skip: !deckId });
  const { data: deckCards, isLoading } = useGetCardsQuery(deckId ?? undefined, { skip: !deckId });
  // «Повторить трудные» запускает сессию по части карточек
  const { cards, sessionKey } = useSessionCardFilter(deckCards);

  if (!deckId) return null;
  if (isLoading) return <PageLoader />;

  return (
    <OrderSession
      key={sessionKey}
      cards={cards ?? []}
      deckKey={deckId}
      deckName={deck?.name ?? ''}
      reviewsDeckUuid={deckId}
      title={deck ? `${deck.name} · ${t('Собери фразу')}` : t('Собери фразу')}
      onExit={() => navigate(RoutePath.DECK(deckId))}
      renderResult={(summary, restart) => (
        <SessionResult
          summary={summary}
          words={cards ?? []}
          onRestart={restart}
          deckId={deckId}
          deckName={deck?.name}
        />
      )}
    />
  );
};

export default OrderPage;
