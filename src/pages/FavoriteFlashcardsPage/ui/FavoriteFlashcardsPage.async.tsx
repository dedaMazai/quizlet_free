import { createAsyncComponent } from '@/shared/lib/utils';

export const FavoriteFlashcardsPageAsync = createAsyncComponent(
  () => import('./FavoriteFlashcardsPage'),
);
