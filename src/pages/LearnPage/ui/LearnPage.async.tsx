import { createAsyncComponent } from '@/shared/lib/utils';

export const LearnPageAsync = createAsyncComponent(() => import('./LearnPage'));
