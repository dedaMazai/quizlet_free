import { RouteNames } from './routerNames';

export const RoutePath = {
  [RouteNames.MAIN]: () => '/',
  [RouteNames.PROFILE]: () => '/profile',
  [RouteNames.CHANGE_PASSWORD]: () => '/change_password',
  [RouteNames.LOGIN]: () => '/login',
  [RouteNames.SETTINGS]: (value?: string) => `/settings${value || ''}`,
  [RouteNames.USER]: (id: string | number) => `/users/${id}`,
  [RouteNames.PRIVACY]: () => '/privacy',
  [RouteNames.FORBIDDEN]: () => '/forbidden',
  // last
  [RouteNames.NOT_FOUND]: () => '/*',
};

export const PUBLIC_PAGES = [
  RoutePath.LOGIN(),
  RoutePath.CHANGE_PASSWORD(),
  RoutePath.PRIVACY(),
] as const;


export const checkIsPublicPage = (pathname: string) => {
  // Нормализуем текущий путь: убираем завершающие слеши и query параметры
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  return PUBLIC_PAGES.some(publicPath => {
      const normalizedPublicPath = publicPath.replace(/\/+$/, '') || '/';
      return normalizedPath === normalizedPublicPath;
  });
};
