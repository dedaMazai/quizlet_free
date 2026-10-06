import { useUserInfo } from '@/entities/User';
import { AuthLayout } from './AuthLayout';
import { PublicLayout } from './PublicLayout';

/** Открытые для поиска страницы (грамматика, roadmap): гость видит их в публичной оболочке, пользователь — в своей */
export const AdaptiveLayout = () => {
    const userInfo = useUserInfo();

    return userInfo ? <AuthLayout /> : <PublicLayout padded />;
};
