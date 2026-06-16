import { useMemo, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useUserInfo, useUserAccesses, checkRequireAccesses, RoleName } from '@/entities/User';
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

  return children;
}
