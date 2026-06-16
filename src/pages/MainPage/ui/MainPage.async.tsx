import { createAsyncComponent } from '@/shared/lib/utils';

export const MainPageAsync = createAsyncComponent(() => import('./MainPage'));
