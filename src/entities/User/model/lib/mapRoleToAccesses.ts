import { Accesses } from '@/shared/types/accesses';
import { RoleName } from '../types/user';

// Права, доступные только администратору (управление пользователями).
const ADMIN_ONLY_ACCESSES: Accesses[] = [
  Accesses.administration,
  Accesses.users_can_create,
  Accesses.users_can_read,
  Accesses.users_can_update,
  Accesses.users_can_delete,
];

// Выводит набор прав из роли. Админ — все права; обычный пользователь — всё, кроме управления пользователями.
export const mapRoleToAccesses = (role: RoleName): Accesses[] => {
  if (role === 'admin') {
    return Object.values(Accesses);
  }
  return Object.values(Accesses).filter((a) => !ADMIN_ONLY_ACCESSES.includes(a));
};
