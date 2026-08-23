import { createAsyncComponent } from '@/shared/lib/utils';

export const AboutPageAsync = createAsyncComponent(() => import('./AboutPage'));
