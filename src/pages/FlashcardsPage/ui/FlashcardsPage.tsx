import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCardsQuery } from '@/entities/Card';
import { useGetDeckQuery } from '@/entities/Deck';
import { FlashcardsGame } from '@/features/FlashcardsGame';
import { PageLoader } from '@/widgets/PageLoader';
import { RoutePath } from '@/shared/config/router/routePath';

const FlashcardsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deckId } = useParams();

  const { data: deck } = useGetDeckQuery(deckId!, { skip: !deckId });
  const { data: cards, isLoading } = useGetCardsQuery(deckId ?? undefined, { skip: !deckId });

  if (!deckId) return null;
  if (isLoading) return <PageLoader />;

  return (
    <FlashcardsGame
      cards={cards ?? []}
      title={deck ? `${deck.name} · ${t('Карточки')}` : t('Карточки')}
      onExit={() => navigate(RoutePath.DECK(deckId))}
      learnPath={RoutePath.LEARN(deckId)}
    />
  );
};

export default FlashcardsPage;
