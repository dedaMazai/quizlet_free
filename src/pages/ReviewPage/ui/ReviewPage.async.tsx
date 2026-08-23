import { createAsyncComponent } from '@/shared/lib/utils';

export const ReviewPageAsync = createAsyncComponent(() => import('./ReviewPage'));
