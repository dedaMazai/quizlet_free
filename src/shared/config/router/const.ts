import { RoutePath } from "@/shared/config/router/routePath";

export const routePathKeys = {
    user: RoutePath.USER,
};

export type RoutePathKeys = keyof typeof routePathKeys;
