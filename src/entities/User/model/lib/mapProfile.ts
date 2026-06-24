import { mapRoleToAccesses } from './mapRoleToAccesses';
import { RoleName, UserInfo } from '../types/user';

// Строка таблицы public.profiles.
export interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  surname: string | null;
  middle_name: string | null;
  tel: string | null;
  description: string | null;
  avatar: string | null;
  role: string | null;
  blocked: boolean | null;
  ai_limit: number | null;
}

// Нормализует значение роли из БД в RoleName (фолбэк — 'user').
export const mapProfileRole = (role: string | null | undefined): RoleName =>
  role === 'admin' ? 'admin' : 'user';

// Маппит строку profiles в доменный UserInfo (для списка пользователей и страницы пользователя).
export const mapProfile = (row: ProfileRow): UserInfo => {
  const role = mapProfileRole(row.role);

  return {
    uuid: row.id,
    email: row.email,
    name: row.name || row.email.split('@')[0] || 'Пользователь',
    surname: row.surname ?? undefined,
    middle_name: row.middle_name ?? undefined,
    tel: row.tel ?? undefined,
    description: row.description ?? undefined,
    avatar: row.avatar ?? undefined,
    blocked: row.blocked ?? false,
    ai_limit: row.ai_limit ?? 5,
    language: 'ru',
    role: {
      uuid: `role-${role}`,
      name: role,
      accesses: mapRoleToAccesses(role),
    },
    created_at: '',
    updated_at: '',
  };
};
