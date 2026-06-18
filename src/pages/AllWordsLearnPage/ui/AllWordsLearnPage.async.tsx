import { createAsyncComponent } from '@/shared/lib/utils';

export const AllWordsLearnPageAsync = createAsyncComponent(
  () => import('./AllWordsLearnPage'),
);
