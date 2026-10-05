import { useMemo, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useGetDecksQuery } from '@/entities/Deck';
import { useUserInfo, useUserAccesses, checkRequireAccesses, RoleName } from '@/entities/User';
import { useGetUserPreferencesQuery } from '@/entities/UserSettings';
import { RoutePath } from '@/shared/config/router/routePath';
import { Accesses } from '@/shared/types/accesses';

interface RequireAuthProps {
  children: ReactNode;
  accesses?: Accesses[];
  forbiddenRoles?: RoleName[];
}

export function RequireAuth({ children, accesses, forbiddenRoles }: RequireAuthProps) {
  const location = useLocation();
  const userInfo = useUserInfo();
  const userAccesses = useUserAccesses();
  // Первый вход: онбординг, пока его не прошли/пропустили и колод нет.
  // Пока данные грузятся или запрос упал — страницу не блокируем.
  const { data: preferences } = useGetUserPreferencesQuery(undefined, { skip: !userInfo });
  const { data: decks } = useGetDecksQuery(undefined, { skip: !userInfo });
  const needsOnboarding = preferences?.onboardingDone === false && decks?.length === 0;

  const hasRequireAccesses = useMemo(() => checkRequireAccesses({ accesses, userAccesses }), [accesses, userAccesses]);
  const hasForbiddenRoles = useMemo(() => userInfo?.role?.name && forbiddenRoles?.includes(
    userInfo.role.name
  ), [forbiddenRoles, userInfo?.role?.name]);

  if (!userInfo) {
    return (
      <Navigate
        to={RoutePath.LOGIN()}
        state={{ from: location }}
        replace
      />
    );
  }

  if (!hasRequireAccesses || hasForbiddenRoles) {
    return (
      <Navigate
        to={RoutePath.FORBIDDEN()}
        state={{ from: location }}
        replace
      />
    );
  }

  if (needsOnboarding && location.pathname !== RoutePath.ONBOARDING()) {
    return <Navigate to={RoutePath.ONBOARDING()} replace />;
  }

  return children;
}
