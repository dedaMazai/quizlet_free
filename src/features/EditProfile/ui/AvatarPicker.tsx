import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserInitials, UserInfo } from '@/entities/User';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AVATARS } from '@/shared/const/avatars';
import cls from './AvatarPicker.module.scss';

interface AvatarPickerProps {
  user?: UserInfo;
  value?: string;
  onChange?: (key: string | undefined) => void;
}

// Выбор аватара: инициалы (без пресета) или пресет из набора. Controlled-поле Form.Item (value/onChange).
export const AvatarPicker: FC<AvatarPickerProps> = (props) => {
  const { user, value, onChange } = props;
  const { t } = useTranslation();

  return (
    <div className={cls.grid}>
      <button
        type="button"
        aria-label={t('Инициалы')}
        aria-pressed={!value}
        className={classNames(cls.item, { [cls.selected]: !value }, [cls.initials])}
        onClick={() => onChange?.(undefined)}
      >
        {getUserInitials(user)}
      </button>
      {AVATARS.map((avatar, index) => (
        <button
          key={avatar.key}
          type="button"
          aria-label={t('Аватар {{index}}', { index: index + 1 })}
          aria-pressed={value === avatar.key}
          className={classNames(cls.item, { [cls.selected]: value === avatar.key })}
          onClick={() => onChange?.(avatar.key)}
        >
          <img className={cls.image} src={avatar.src} alt="" />
        </button>
      ))}
    </div>
  );
};
