import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useGetCardsQuery } from '@/entities/Card';
import { FlashcardsGame } from '@/features/FlashcardsGame';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';

const AllWordsFlashcardsPage = () => {
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
          {t('Карточки')}: {t('Все слова')}
        </MyTypography.Large>
      </HStack>
      <FlashcardsGame cards={cards ?? []} />
    </VStack>
  );
};

export default AllWordsFlashcardsPage;
