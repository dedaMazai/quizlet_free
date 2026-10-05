import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCardsQuery, useLibraryFilterCards, ALL_WORDS_PROGRESS_KEY } from '@/entities/Card';
import { LearnSession } from '@/features/LearnSession';
import { PageLoader } from '@/widgets/PageLoader';
import { SessionResult } from '@/widgets/SessionResult';
import { RoutePath } from '@/shared/config/router/routePath';
import { useSessionCardFilter } from '@/shared/lib/session';

const AllWordsLearnPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: allCards, isLoading } = useGetCardsQuery();
  // «Заучивать выборку» передаёт фильтр «Всех слов» в query-параметрах
  const { cards: selection, isLoading: isSelectionLoading } = useLibraryFilterCards(allCards);
  // «Повторить трудные» запускает сессию по части карточек
  const { cards, sessionKey } = useSessionCardFilter(selection);

  if (isLoading || isSelectionLoading || !cards) return <PageLoader />;

  return (
    <LearnSession
      key={sessionKey}
      cards={cards}
      deckKey={ALL_WORDS_PROGRESS_KEY}
      deckName={ALL_WORDS_PROGRESS_KEY}
      title={`${t('Все слова')} · ${t('Заучивание')}`}
      onExit={() => navigate(RoutePath.ALL_WORDS())}
      renderResult={(summary, restart) => (
        <SessionResult
          summary={summary}
          words={cards}
          onRestart={restart}
        />
      )}
    />
  );
};

export default AllWordsLearnPage;
