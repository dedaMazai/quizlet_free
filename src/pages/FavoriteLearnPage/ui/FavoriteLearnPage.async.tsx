import { createAsyncComponent } from '@/shared/lib/utils';

export const FavoriteLearnPageAsync = createAsyncComponent(
  () => import('./FavoriteLearnPage'),
);
