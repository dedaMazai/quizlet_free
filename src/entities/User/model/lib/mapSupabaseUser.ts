import type { User } from '@supabase/supabase-js';
import { Accesses } from '@/shared/types/accesses';
import { UserInfo } from '../types/user';

// Преобразует пользователя Supabase в доменный UserInfo.
// Ролевой модели в Supabase нет — для приложения «для своих» выдаём полный набор
// прав, чтобы RBAC не блокировал страницы.
export const mapSupabaseUser = (user: User): UserInfo => {
  const metaName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : undefined;

  return {
    uuid: user.id,
    email: user.email ?? '',
    name: metaName || user.email?.split('@')[0] || 'Пользователь',
    language: 'ru',
    role: {
      uuid: 'role-user',
      name: 'viewer',
      accesses: Object.values(Accesses),
    },
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  };
};
