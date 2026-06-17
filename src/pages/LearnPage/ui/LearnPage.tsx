import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useGetDeckQuery } from '@/entities/Deck';
import { LearnSession } from '@/features/LearnSession';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';

const LearnPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deckId } = useParams();

  const { data: deck } = useGetDeckQuery(deckId!, { skip: !deckId });

  if (!deckId) return null;

  return (
    <VStack max fullHeight gap="16">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(RoutePath.DECK(deckId))}
      >
        {t('Назад')}
      </Button>
      <VStack max gap="24" align="center">
        <MyTypography.Large strong>
          {t('Заучивание')}{deck ? `: ${deck.name}` : ''}
        </MyTypography.Large>
        <LearnSession deckUuid={deckId} />
      </VStack>
    </VStack>
  );
};

export default LearnPage;
