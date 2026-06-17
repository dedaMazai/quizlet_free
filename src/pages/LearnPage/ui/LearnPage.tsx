import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetDeckQuery } from '@/entities/Deck';
import { LearnSession } from '@/features/LearnSession';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';

const LearnPage = () => {
  const { t } = useTranslation();
  const { deckId } = useParams();

  const { data: deck } = useGetDeckQuery(deckId!, { skip: !deckId });

  if (!deckId) return null;

  return (
    <VStack max fullHeight gap="24" align="center">
      <MyTypography.Large strong>
        {t('Заучивание')}{deck ? `: ${deck.name}` : ''}
      </MyTypography.Large>
      <LearnSession deckUuid={deckId} />
    </VStack>
  );
};

export default LearnPage;
