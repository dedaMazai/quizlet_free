import { useTranslation } from 'react-i18next';
import { CardList } from '@/widgets/CardList';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';

const AllWordsPage = () => {
  const { t } = useTranslation();

  return (
    <VStack max fullHeight gap="16">
      <MyTypography.Large strong>{t('Все слова')}</MyTypography.Large>
      <CardList />
    </VStack>
  );
};

export default AllWordsPage;
