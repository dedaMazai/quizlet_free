import { createAsyncComponent } from '@/shared/lib/utils';

// Условие по __IS_DEV__ вырезается webpack на этапе сборки — в прод-бандл чанк не попадает
export const DevUiPageAsync = createAsyncComponent(() => (
    __IS_DEV__ ? import('./DevUiPage') : Promise.reject(new Error('DevUiPage is dev-only'))
));
