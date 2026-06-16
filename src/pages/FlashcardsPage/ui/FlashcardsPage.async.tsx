import { createAsyncComponent } from '@/shared/lib/utils';

export const FlashcardsPageAsync = createAsyncComponent(() => import('./FlashcardsPage'));
