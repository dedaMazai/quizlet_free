import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useUserInfo } from '@/entities/User';
import { RoutePath } from '@/shared/config/router/routePath';

interface RequireNotAuthProps {
    children: ReactNode;
}

export function RequireNotAuth({ children }: RequireNotAuthProps) {
    const userInfo = useUserInfo();
    const { state } = useLocation();

    if (userInfo) {
        const mainPage = RoutePath.MAIN();
        const routeTo = state?.from ? state?.from : mainPage;

        return (
            <Navigate
                to={routeTo}
                replace
            />
        );
    }

    return children;
}
