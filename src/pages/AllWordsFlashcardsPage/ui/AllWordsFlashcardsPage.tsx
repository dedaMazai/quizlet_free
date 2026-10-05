import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCardsQuery } from '@/entities/Card';
import { FlashcardsGame } from '@/features/FlashcardsGame';
import { PageLoader } from '@/widgets/PageLoader';
import { RoutePath } from '@/shared/config/router/routePath';

const AllWordsFlashcardsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: cards, isLoading } = useGetCardsQuery();

  if (isLoading) return <PageLoader />;

  return (
    <FlashcardsGame
      cards={cards ?? []}
      title={`${t('Все слова')} · ${t('Карточки')}`}
      onExit={() => navigate(RoutePath.ALL_WORDS())}
      learnPath={RoutePath.ALL_WORDS_LEARN()}
    />
  );
};

export default AllWordsFlashcardsPage;
