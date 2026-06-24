import { FC } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AVATARS } from '@/shared/const/avatars';
import cls from './AvatarPicker.module.scss';

interface AvatarPickerProps {
  value?: string;
  onChange?: (key: string) => void;
}

// Выбор аватарки из набора пресетов. Работает как controlled-поле Form.Item (value/onChange).
export const AvatarPicker: FC<AvatarPickerProps> = (props) => {
  const { value, onChange } = props;

  return (
    <div className={cls.grid}>
      {AVATARS.map((avatar) => (
        <button
          key={avatar.key}
          type="button"
          className={classNames(cls.item, { [cls.selected]: value === avatar.key })}
          onClick={() => onChange?.(avatar.key)}
        >
          <Avatar size={56} src={avatar.src} icon={<UserOutlined />} />
        </button>
      ))}
    </div>
  );
};
