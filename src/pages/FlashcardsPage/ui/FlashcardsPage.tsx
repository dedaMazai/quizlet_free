import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCardsQuery } from '@/entities/Card';
import { useGetDeckQuery } from '@/entities/Deck';
import { FlashcardsGame } from '@/features/FlashcardsGame';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';

const FlashcardsPage = () => {
  const { t } = useTranslation();
  const { deckId } = useParams();

  const { data: deck } = useGetDeckQuery(deckId!, { skip: !deckId });
  const { data: cards, isLoading } = useGetCardsQuery(deckId ?? undefined, { skip: !deckId });

  if (!deckId) return null;
  if (isLoading) return <Loader />;

  return (
    <VStack max fullHeight gap="24">
      <MyTypography.Large strong>
        {t('Карточки')}{deck ? `: ${deck.name}` : ''}
      </MyTypography.Large>
      <FlashcardsGame cards={cards ?? []} />
    </VStack>
  );
};

export default FlashcardsPage;
