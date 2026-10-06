import { createAsyncComponent } from '@/shared/lib/utils';

export const LegalPageAsync = createAsyncComponent(() => import('./LegalPage'));
