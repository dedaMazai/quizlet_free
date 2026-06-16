import { createAsyncComponent } from '@/shared/lib/utils';

export const ForbiddenPageAsync = createAsyncComponent(() => import('./ForbiddenPage'));
