import { createAsyncComponent } from '@/shared/lib/utils';

export const WritePageAsync = createAsyncComponent(() => import('./WritePage'));
