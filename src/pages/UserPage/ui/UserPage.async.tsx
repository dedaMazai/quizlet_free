import { createAsyncComponent } from '@/shared/lib/utils';

export const UserPageAsync = createAsyncComponent(() => import('./UserPage'));
