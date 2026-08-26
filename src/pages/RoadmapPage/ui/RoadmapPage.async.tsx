import { createAsyncComponent } from '@/shared/lib/utils';

export const RoadmapPageAsync = createAsyncComponent(() => import('./RoadmapPage'));
