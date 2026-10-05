import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ReadOutlined, BulbOutlined } from '@ant-design/icons';
import { useGetFavoritesQuery, useGetCardsPageQuery } from '@/entities/Card';
import { CardList } from '@/widgets/CardList';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';

const FavoritesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: favorites } = useGetFavoritesQuery();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Сортированная копия — стабильный ключ кэша RTK Query при том же наборе избранного.
  const uuids = useMemo(() => [...(favorites ?? [])].sort(), [favorites]);
  const { data: cardsPage, isLoading } = useGetCardsPageQuery(
    { page, pageSize, uuids },
    { skip: !favorites },
  );

  const count = favorites?.length ?? 0;
  const isEmpty = count === 0;
  const total = cardsPage?.total ?? 0;

  // Если текущая страница опустела (сняли звёздочки) — откатываемся назад.
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) setPage(maxPage);
  }, [total, page, pageSize]);

  return (
    <VStack max fullHeight gap="16">
      <SectionPageHeader
        section={NavSectionKey.LIBRARY}
        extra={(
          <>
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
          </>
        )}
      />
      <MyTypography.Base type="secondary">
        {t('{{count}} слов', { count })}
      </MyTypography.Base>

      <CardList
        cards={cardsPage?.cards}
        loading={isLoading || !favorites}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
        emptyText={t('В избранном пока нет слов')}
      />
    </VStack>
  );
};

export default FavoritesPage;
