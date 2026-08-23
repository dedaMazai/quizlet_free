import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useGetDeckQuery } from '@/entities/Deck';
import { useGetCardsQuery } from '@/entities/Card';
import { OrderSession } from '@/features/OrderSession';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';

const OrderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { deckId } = useParams();

  const { data: deck } = useGetDeckQuery(deckId!, { skip: !deckId });
  const { data: cards, isLoading } = useGetCardsQuery(deckId ?? undefined, { skip: !deckId });

  if (!deckId) return null;
  if (isLoading) return <Loader />;

  return (
    <VStack max fullHeight gap="24">
      <HStack gap="8" align="center">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(RoutePath.DECK(deckId))}
        />
        <MyTypography.Large strong>
          {t('Собери фразу')}{deck ? `: ${deck.name}` : ''}
        </MyTypography.Large>
      </HStack>
      <OrderSession
        cards={cards ?? []}
        deckKey={deckId}
        deckName={deck?.name ?? ''}
        reviewsDeckUuid={deckId}
      />
    </VStack>
  );
};

export default OrderPage;
