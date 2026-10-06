import type { RouteObject } from 'react-router';
import { RouteNames } from '../config/router/routerNames';
import { Accesses } from './accesses';
import { RoleName } from '@/entities/User';

// export type AppRoutesProps = Omit<RouteObject, 'children'> & {
export type AppRoutesProps = RouteObject & {
    authOnly?: boolean;
    notAuthOnly?: boolean;
    withSidebar?: boolean;
    publicLayout?: boolean;
    /** Публичная страница: гостю — PublicLayout, пользователю — AuthLayout с сайдбаром */
    adaptiveLayout?: boolean;
    withFooter?: boolean;
    /** Фокус-режим занятий: без сайдбара и шапки */
    focusLayout?: boolean;
    accesses?: Accesses[];
    forbiddenRoles?: RoleName[];
    children?: AppRoutesProps[];
};

export type RouteNameType = keyof typeof RouteNames;