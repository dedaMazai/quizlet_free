import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useGetCardsQuery } from '@/entities/Card';
import { useGetDeckQuery } from '@/entities/Deck';
import { FlashcardsGame } from '@/features/FlashcardsGame';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';

const FlashcardsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deckId } = useParams();

  const { data: deck } = useGetDeckQuery(deckId!, { skip: !deckId });
  const { data: cards, isLoading } = useGetCardsQuery(deckId ?? undefined, { skip: !deckId });

  if (!deckId) return null;
  if (isLoading) return <Loader />;

  return (
    <VStack max fullHeight gap="16">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(RoutePath.DECK(deckId))}
      >
        {t('Назад')}
      </Button>
      <MyTypography.Large strong>
        {t('Карточки')}{deck ? `: ${deck.name}` : ''}
      </MyTypography.Large>
      <FlashcardsGame cards={cards ?? []} />
    </VStack>
  );
};

export default FlashcardsPage;
