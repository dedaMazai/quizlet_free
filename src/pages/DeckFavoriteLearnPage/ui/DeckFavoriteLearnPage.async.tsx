import { createAsyncComponent } from '@/shared/lib/utils';

export const DeckFavoriteLearnPageAsync = createAsyncComponent(
  () => import('./DeckFavoriteLearnPage'),
);
