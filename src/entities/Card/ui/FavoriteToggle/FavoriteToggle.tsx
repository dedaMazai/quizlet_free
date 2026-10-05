import { FC, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tooltip } from 'antd';
import { Star } from 'lucide-react';
import {
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
} from '../../model/api/cardApi';
import cls from './FavoriteToggle.module.scss';

const STAR_SIZE = 20;
const ICON_STROKE = 1.5;

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
        aria-label={actionLabel}
        aria-pressed={isFavorite}
        icon={(
          <Star
            aria-hidden
            className={isFavorite ? cls.starActive : undefined}
            size={STAR_SIZE}
            strokeWidth={ICON_STROKE}
          />
        )}
        onClick={handleClick}
      />
    </Tooltip>
  );
};
