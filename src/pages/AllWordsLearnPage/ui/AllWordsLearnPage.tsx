import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useGetCardsQuery, ALL_WORDS_PROGRESS_KEY } from '@/entities/Card';
import { LearnSession } from '@/features/LearnSession';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';

const AllWordsLearnPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: cards, isLoading } = useGetCardsQuery();

  if (isLoading) return <Loader />;

  return (
    <VStack max fullHeight gap="24">
      <HStack gap="8" align="center">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(RoutePath.ALL_WORDS())}
        />
        <MyTypography.Large strong>
          {t('Заучивание')}: {t('Все слова')}
        </MyTypography.Large>
      </HStack>
      <LearnSession cards={cards ?? []} progressKey={ALL_WORDS_PROGRESS_KEY} />
    </VStack>
  );
};

export default AllWordsLearnPage;
