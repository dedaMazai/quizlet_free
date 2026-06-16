import { ReactNode } from 'react';
import { RouteNames } from './routerNames';

export type RouteConfigType = {
  authOnly?: boolean
  roles?: string[]
  label?: string
  path: string
  element: ReactNode
};

export type RouteNameType = keyof typeof RouteNames;
