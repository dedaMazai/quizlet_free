import { createAsyncComponent } from '@/shared/lib/utils';

export const AllWordsFlashcardsPageAsync = createAsyncComponent(
  () => import('./AllWordsFlashcardsPage'),
);
