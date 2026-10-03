import { createAsyncComponent } from '@/shared/lib/utils';

export const CyclePageAsync = createAsyncComponent(() => import('./CyclePage'));
