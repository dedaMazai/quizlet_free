import { createAsyncComponent } from '@/shared/lib/utils';

export const OnboardingPageAsync = createAsyncComponent(() => import('./OnboardingPage'));
