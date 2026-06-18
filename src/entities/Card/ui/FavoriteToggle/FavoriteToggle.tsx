import { FC, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tooltip } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import {
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
} from '../../model/api/cardApi';
import cls from './FavoriteToggle.module.scss';

interface FavoriteToggleProps {
  cardUuid: string;
  className?: string;
}

export const FavoriteToggle: FC<FavoriteToggleProps> = (props) => {
  const { cardUuid, className } = props;
  const { t } = useTranslation();

  const { data: favorites } = useGetFavoritesQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();

  const isFavorite = Boolean(favorites?.includes(cardUuid));

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(cardUuid);
  };

  const actionLabel = isFavorite ? t('Убрать из избранного') : t('Добавить в избранное');

  return (
    <Tooltip title={actionLabel}>
      <Button
        className={className}
        type="text"
        shape="circle"
        aria-label={actionLabel}
        icon={isFavorite
          ? <StarFilled className={cls.starActive} />
          : <StarOutlined className={cls.star} />}
        onClick={handleClick}
      />
    </Tooltip>
  );
};
