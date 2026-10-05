import type { UserInfo } from '@/entities/User';

/** «Анна Смирнова»: имя и фамилия, иначе почта */
export const getUserFullName = (user: Pick<UserInfo, 'name' | 'surname' | 'email'>): string => (
    [user.name, user.surname].filter(Boolean).join(' ') || user.email
);
