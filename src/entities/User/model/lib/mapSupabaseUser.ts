import type { User } from '@supabase/supabase-js';
import { mapRoleToAccesses } from './mapRoleToAccesses';
import { RoleName, UserInfo } from '../types/user';

// Базовый маппинг пользователя Supabase в доменный UserInfo (без обращения к БД).
// Роль и поля профиля подгружаются отдельно в fetchUserInfo из таблицы profiles.
export const mapSupabaseUser = (user: User, role: RoleName = 'user'): UserInfo => {
  const metaName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : undefined;

  return {
    uuid: user.id,
    email: user.email ?? '',
    name: metaName || user.email?.split('@')[0] || 'Пользователь',
    language: 'ru',
    role: {
      uuid: `role-${role}`,
      name: role,
      accesses: mapRoleToAccesses(role),
    },
    created_at: user.created_at,
    updated_at: user.updated_at ?? user.created_at,
  };
};
