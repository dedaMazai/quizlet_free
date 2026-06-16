import { createAsyncComponent } from '@/shared/lib/utils';

export const PrivacyPageAsync = createAsyncComponent(() => import('./PrivacyPage'));
