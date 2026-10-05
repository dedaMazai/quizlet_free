import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetDeckQuery } from '@/entities/Deck';
import { useGetCardsQuery } from '@/entities/Card';
import { WriteSession } from '@/features/WriteSession';
import { PageLoader } from '@/widgets/PageLoader';
import { SessionResult } from '@/widgets/SessionResult';
import { RoutePath } from '@/shared/config/router/routePath';
import { useSessionCardFilter } from '@/shared/lib/session';

const WritePage = () => {
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
    <WriteSession
      key={sessionKey}
      cards={cards ?? []}
      deckKey={deckId}
      deckName={deck?.name ?? ''}
      reviewsDeckUuid={deckId}
      title={deck ? `${deck.name} · ${t('Письмо')}` : t('Письмо')}
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

export default WritePage;
