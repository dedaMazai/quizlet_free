import { createAsyncComponent } from '@/shared/lib/utils';

export const FeaturesPageAsync = createAsyncComponent(() => import('./FeaturesPage'));
