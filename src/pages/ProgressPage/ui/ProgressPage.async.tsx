import { createAsyncComponent } from '@/shared/lib/utils';

export const ProgressPageAsync = createAsyncComponent(() => import('./ProgressPage'));
