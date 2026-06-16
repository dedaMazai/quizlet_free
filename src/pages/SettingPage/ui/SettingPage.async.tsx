import { createAsyncComponent } from '@/shared/lib/utils';

export const SettingPageAsync = createAsyncComponent(() => import('./SettingPage'));
