import { FC } from 'react';
import cls from './ShareDeckModal.module.scss';

interface UserAvatarProps {
    email: string;
    name?: string;
}

const getInitials = (name?: string, email?: string): string => {
    const source = (name ?? email ?? '').trim();
    if (!source) return '';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
};

/** Квадрат с инициалами 34×34 (Modals 6.30) */
export const UserAvatar: FC<UserAvatarProps> = (props) => {
    const { email, name } = props;

    return <span aria-hidden className={cls.avatar}>{getInitials(name, email)}</span>;
};
