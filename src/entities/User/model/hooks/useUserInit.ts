import { useUserInfoQuery } from '@/entities/User';

// Восстановление сессии при старте: userInfo читает сессию Supabase и через
// onQueryStarted проставляет _inited и данные пользователя (или оставляет
// приложение неавторизованным, если сессии нет).
export const useUserInit = () => {
    useUserInfoQuery();
};
