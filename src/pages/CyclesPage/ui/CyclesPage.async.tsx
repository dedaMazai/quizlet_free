import { createAsyncComponent } from '@/shared/lib/utils';

export const CyclesPageAsync = createAsyncComponent(() => import('./CyclesPage'));
