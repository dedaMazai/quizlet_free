import { createAsyncComponent } from '@/shared/lib/utils';

export const GrammarTopicPageAsync = createAsyncComponent(() => import('./GrammarTopicPage'));
