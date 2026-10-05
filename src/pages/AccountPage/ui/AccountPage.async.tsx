import { createAsyncComponent } from '@/shared/lib/utils';

export const AccountPageAsync = createAsyncComponent(() => import('./AccountPage'));
