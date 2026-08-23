import { createAsyncComponent } from '@/shared/lib/utils';

export const FaqPageAsync = createAsyncComponent(() => import('./FaqPage'));
