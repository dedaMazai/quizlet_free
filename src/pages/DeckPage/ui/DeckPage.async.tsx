import { createAsyncComponent } from '@/shared/lib/utils';

export const DeckPageAsync = createAsyncComponent(() => import('./DeckPage'));
