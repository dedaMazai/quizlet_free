import type { User } from '@supabase/supabase-js';
import { supabase } from '@/shared/api/supabaseClient';
import { mapSupabaseUser } from './mapSupabaseUser';
import { mapRoleToAccesses } from './mapRoleToAccesses';
import { ProfileRow, mapProfileRole } from './mapProfile';
import { UserInfo } from '../types/user';

// Собирает доменный UserInfo: базовый маппинг auth-пользователя + поля и роль из таблицы profiles.
export const fetchUserInfo = async (user: User): Promise<UserInfo> => {
  const base = mapSupabaseUser(user);

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<ProfileRow>();

  if (!data) {
    return base;
  }

  const role = mapProfileRole(data.role);

  return {
    ...base,
    name: data.name || base.name,
    surname: data.surname ?? undefined,
    middle_name: data.middle_name ?? undefined,
    tel: data.tel ?? undefined,
    description: data.description ?? undefined,
    avatar: data.avatar ?? undefined,
    blocked: data.blocked ?? false,
    role: {
      uuid: `role-${role}`,
      name: role,
      accesses: mapRoleToAccesses(role),
    },
  };
};
