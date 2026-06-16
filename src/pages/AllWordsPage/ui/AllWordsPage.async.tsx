import { createAsyncComponent } from '@/shared/lib/utils';

export const AllWordsPageAsync = createAsyncComponent(() => import('./AllWordsPage'));
