import { FC } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './ShareDeckModal.module.scss';

interface UserAvatarProps {
    email: string;
    name?: string;
    size?: number;
}

const COLOR_COUNT = 8;

const getInitials = (name?: string, email?: string): string => {
    const source = (name ?? email ?? '').trim();
    if (!source) return '';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
};

const getColorIndex = (key: string): number => {
    const sum = Array.from(key).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return sum % COLOR_COUNT;
};

export const UserAvatar: FC<UserAvatarProps> = (props) => {
    const { email, name, size = 36 } = props;
    const initials = getInitials(name, email);
    const colorClass = (cls as Record<string, string>)[`c${getColorIndex(email)}`];

    return (
        <Avatar
            size={size}
            className={classNames(cls.avatar, [colorClass])}
            icon={initials ? undefined : <UserOutlined />}
        >
            {initials || undefined}
        </Avatar>
    );
};
