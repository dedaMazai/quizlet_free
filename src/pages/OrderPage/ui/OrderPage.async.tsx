import { createAsyncComponent } from '@/shared/lib/utils';

export const OrderPageAsync = createAsyncComponent(() => import('./OrderPage'));
