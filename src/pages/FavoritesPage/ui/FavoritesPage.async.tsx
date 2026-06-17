import { createAsyncComponent } from '@/shared/lib/utils';

export const FavoritesPageAsync = createAsyncComponent(() => import('./FavoritesPage'));
