import type { RouteObject } from 'react-router';
import { RouteNames } from '../config/router/routerNames';
import { Accesses } from './accesses';
import { RoleName } from '@/entities/User';

// export type AppRoutesProps = Omit<RouteObject, 'children'> & {
export type AppRoutesProps = RouteObject & {
    authOnly?: boolean;
    notAuthOnly?: boolean;
    withSidebar?: boolean;
    withFooter?: boolean;
    accesses?: Accesses[];
    forbiddenRoles?: RoleName[];
    children?: AppRoutesProps[];
};

export type RouteNameType = keyof typeof RouteNames;