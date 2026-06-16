import { createAsyncComponent } from '@/shared/lib/utils';

export const ProfilePageAsync = createAsyncComponent(() => import('./ProfilePage'));
