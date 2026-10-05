import { ComponentType, lazy } from 'react';
import { ErrorFallback } from '@/shared/ui/ErrorFallback';

/** React.lazy с запасным ErrorFallback, если чанк не загрузился. Пропсы берутся из default-экспорта модуля. */
export const createAsyncComponent = <P extends object>(
  importPath: () => Promise<{ default: ComponentType<P> }>,
) => lazy(async () => {
  try {
    return await importPath();
  } catch {
    const Fallback: ComponentType<P> = () => <ErrorFallback />;
    return { default: Fallback };
  }
});
