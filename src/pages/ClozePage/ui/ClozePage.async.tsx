import { createAsyncComponent } from '@/shared/lib/utils';

export const ClozePageAsync = createAsyncComponent(() => import('./ClozePage'));
