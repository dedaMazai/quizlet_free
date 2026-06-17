import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ReadOutlined, BulbOutlined, StarFilled } from '@ant-design/icons';
import { useGetFavoritesQuery } from '@/entities/Card';
import { CardList } from '@/widgets/CardList';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './FavoritesPage.module.scss';

const FavoritesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: favorites } = useGetFavoritesQuery();
  const count = favorites?.length ?? 0;
  const isEmpty = count === 0;

  return (
    <VStack max fullHeight gap="16">
      <HStack max justify="between" align="start" gap="16" wrap>
        <HStack gap="12" align="center">
          <span className={cls.starBox}><StarFilled /></span>
          <VStack gap="4">
            <MyTypography.Large strong>{t('Избранное')}</MyTypography.Large>
            <MyTypography.Base type="secondary">
              {t('{{count}} слов', { count })}
            </MyTypography.Base>
          </VStack>
        </HStack>
        <HStack gap="8" wrap>
          <Button
            icon={<ReadOutlined />}
            disabled={isEmpty}
            onClick={() => navigate(RoutePath.FAVORITES_FLASHCARDS())}
          >
            {t('Карточки')}
          </Button>
          <Button
            type="primary"
            icon={<BulbOutlined />}
            disabled={isEmpty}
            onClick={() => navigate(RoutePath.FAVORITES_LEARN())}
          >
            {t('Заучивание')}
          </Button>
        </HStack>
      </HStack>

      <CardList favoritesOnly />
    </VStack>
  );
};

export default FavoritesPage;
