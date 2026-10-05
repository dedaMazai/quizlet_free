import { memo } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { getAvatarSrc } from '@/shared/const/avatars';
import { UserInfo } from '../../model/types/user';
import cls from './UserAvatar.module.scss';

export enum UserAvatarSize {
    /** 30px — строка таблицы */
    SM = 'sm',
    /** 34px — выбор аватара */
    PICK = 'pick',
    /** 48px — панель пользователя */
    MD = 'md',
    /** 88px — профиль */
    LG = 'lg',
}

type UserAvatarUser = Pick<UserInfo, 'name' | 'surname' | 'email' | 'avatar'>;

interface UserAvatarProps {
    user?: UserAvatarUser;
    size?: UserAvatarSize;
    className?: string;
}

/** Инициалы: первые буквы имени и фамилии («Илья Ковалёв» → «ИК») */
export const getUserInitials = (user?: UserAvatarUser): string => {
    if (!user) return '';
    const letters = [user.name, user.surname]
        .map((part) => part?.trim()[0])
        .filter(Boolean)
        .join('');
    return (letters || user.email.slice(0, 2)).toUpperCase();
};

/** Квадратный аватар: пресет из набора или инициалы на accent-200 */
export const UserAvatar = memo((props: UserAvatarProps) => {
    const { user, size = UserAvatarSize.SM, className } = props;
    const src = getAvatarSrc(user?.avatar);

    return (
        <span aria-hidden className={classNames(cls.UserAvatar, [className, cls[size]])}>
            {src ? <img className={cls.image} src={src} alt="" /> : getUserInitials(user)}
        </span>
    );
});

UserAvatar.displayName = 'UserAvatar';
