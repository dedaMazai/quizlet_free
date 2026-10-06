import { useMemo, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useGetDecksQuery } from '@/entities/Deck';
import {
  useUserInfo, useUserAccesses, useUserLoggedOut, checkRequireAccesses, RoleName,
} from '@/entities/User';
import { useGetUserPreferencesQuery } from '@/entities/UserSettings';
import { RoutePath } from '@/shared/config/router/routePath';
import { Accesses } from '@/shared/types/accesses';
import { isTelegramMiniApp } from '@/shared/lib/telegram';

interface RequireAuthProps {
  children: ReactNode;
  accesses?: Accesses[];
  forbiddenRoles?: RoleName[];
}

export function RequireAuth({ children, accesses, forbiddenRoles }: RequireAuthProps) {
  const location = useLocation();
  const userInfo = useUserInfo();
  const loggedOut = useUserLoggedOut();
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
    // Гость на главной и только что вышедший пользователь видят лендинг;
    // остальные защищённые ссылки ведут на вход с возвратом обратно.
    // В Telegram лендинг не нужен — сразу вход (там же «Продолжить через Telegram»)
    if (!isTelegramMiniApp() && (location.pathname === RoutePath.MAIN() || loggedOut)) {
      return <Navigate to={RoutePath.ABOUT()} replace />;
    }

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

  // Приглашение в контакты открывается и до онбординга: иначе новичок потеряет ссылку
  const isInvite = location.pathname.startsWith(RoutePath.INVITE(''));
  if (needsOnboarding && location.pathname !== RoutePath.ONBOARDING() && !isInvite) {
    return <Navigate to={RoutePath.ONBOARDING()} replace />;
  }

  return children;
}
