import { Suspense, useMemo } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router';
import type { RouteObject } from 'react-router';
import { PageLoader } from '@/widgets/PageLoader';
import { RequireAuth } from './RequireAuth';
import { routeConfig } from '../config/routeConfig';
import { AppRoutesProps } from '@/shared/types/router';
import { RequireNotAuth } from './RequireNotAuth';
import { App } from '@/app/App';
import { RouterErrorBoundary } from './RouterErrorBoundary';
import { AuthLayout } from './AuthLayout';

const toRouteObject = (route: AppRoutesProps): RouteObject => {
    let { element } = route;

    if (route.authOnly) {
        element = (
            <RequireAuth
                accesses={route.accesses}
                forbiddenRoles={route.forbiddenRoles}
            >
                {element}
            </RequireAuth>
        );
    } else if (route.notAuthOnly) {
        element = <RequireNotAuth>{element}</RequireNotAuth>;
    }

    return {
        path: route.path,
        children: route.children,
        handle: route.handle,
        errorElement: <RouterErrorBoundary />,
        element,
    };
};

export const AppRouter = () => {
    const router = useMemo(() => {
        const sidebarRoutes: AppRoutesProps[] = [];
        const authNoSidebarRoutes: AppRoutesProps[] = [];
        const publicRoutes: AppRoutesProps[] = [];

        for (const route of routeConfig) {
            if (route.authOnly && route.withSidebar) {
                sidebarRoutes.push(route);
            } else if (route.authOnly) {
                authNoSidebarRoutes.push(route);
            } else {
                publicRoutes.push(route);
            }
        }

        return createBrowserRouter([
            {
                element: <App />,
                children: [
                    {
                        element: <AuthLayout />,
                        children: sidebarRoutes.map(toRouteObject),
                    },
                    {
                        element: <AuthLayout withSidebar={false} />,
                        children: authNoSidebarRoutes.map(toRouteObject),
                    },
                    {
                        element: (
                            <Suspense fallback={<PageLoader />}>
                                <Outlet />
                            </Suspense>
                        ),
                        children: publicRoutes.map(toRouteObject),
                    },
                ],
            },
        ]);
    }, []);

    return <RouterProvider router={router} />;
};
