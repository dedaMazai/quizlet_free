import { lazy } from 'react';
import { ErrorFallback } from '@/shared/ui/ErrorFallback';

export const createAsyncComponent = (importPath: () => Promise<any>) => lazy(async () => {
  try {
    return await importPath();
  } catch {
    return {
      default: () => <ErrorFallback />
    };
  }
});
