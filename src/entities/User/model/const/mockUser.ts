import { Accesses } from '@/shared/types/accesses';
import { UserInfo } from '../types/user';

// Мок текущего пользователя: приложение всегда «залогинено» обычным пользователем.
// Бэкенда нет — авторизация замокана, /users/me не запрашивается.
export const MOCK_USER: UserInfo = {
  uuid: 'mock-user',
  email: 'user@example.com',
  name: 'Пользователь',
  language: 'ru',
  role: {
    uuid: 'mock-role-user',
    name: 'viewer',
    // Полный набор прав, чтобы ни одна страница не упиралась в «нет доступа».
    accesses: Object.values(Accesses),
  },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};
