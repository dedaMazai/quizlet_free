import { createAsyncComponent } from '@/shared/lib/utils';

export const LoginPageAsync = createAsyncComponent(() => import('./LoginPage'));
