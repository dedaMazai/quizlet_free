import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  useGetCardsQuery,
  useGetFavoritesQuery,
  FAVORITES_PROGRESS_KEY,
} from '@/entities/Card';
import { LearnSession } from '@/features/LearnSession';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';

const FavoriteLearnPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: cards, isLoading } = useGetCardsQuery();
  const { data: favorites } = useGetFavoritesQuery();

  const favCards = useMemo(
    () => (cards ?? []).filter((card) => favorites?.includes(card.uuid)),
    [cards, favorites],
  );

  if (isLoading) return <Loader />;

  return (
    <VStack max fullHeight gap="24">
      <HStack gap="8" align="center">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(RoutePath.FAVORITES())}
        />
        <MyTypography.Large strong>
          {t('Заучивание')}: {t('Избранное')}
        </MyTypography.Large>
      </HStack>
      <LearnSession cards={favCards} progressKey={FAVORITES_PROGRESS_KEY} deckName={FAVORITES_PROGRESS_KEY} />
    </VStack>
  );
};

export default FavoriteLearnPage;
