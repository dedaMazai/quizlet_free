import { createAsyncComponent } from '@/shared/lib/utils';

export const DecksPageAsync = createAsyncComponent(() => import('./DecksPage'));
