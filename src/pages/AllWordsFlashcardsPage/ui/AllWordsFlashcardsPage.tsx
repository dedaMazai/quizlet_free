import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCardsQuery, useLibraryFilterCards } from '@/entities/Card';
import { FlashcardsGame } from '@/features/FlashcardsGame';
import { PageLoader } from '@/widgets/PageLoader';
import { RoutePath } from '@/shared/config/router/routePath';

const AllWordsFlashcardsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: allCards, isLoading } = useGetCardsQuery();
  // Карточки по выборке «Всех слов» из query-параметров
  const { cards, isLoading: isSelectionLoading } = useLibraryFilterCards(allCards);

  if (isLoading || isSelectionLoading) return <PageLoader />;

  return (
    <FlashcardsGame
      cards={cards ?? []}
      title={`${t('Все слова')} · ${t('Карточки')}`}
      onExit={() => navigate(RoutePath.ALL_WORDS())}
      learnPath={`${RoutePath.ALL_WORDS_LEARN()}${location.search}`}
    />
  );
};

export default AllWordsFlashcardsPage;
