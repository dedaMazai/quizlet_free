import { FC, useMemo } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router';
import * as Sentry from "@sentry/react";
import { ErrorPage } from '@/widgets/ErrorPage';

/**
 * RouterErrorBoundary - компонент для отображения ошибок React Router
 * Использует useRouteError() для получения ошибки и отображает её через ErrorPage
 * 
 * ВАЖНО: Этот компонент НЕ ловит ошибки сам - он только отображает уже пойманные Router'ом ошибки
 */
export const RouterErrorBoundary: FC = () => {
  const error = useRouteError();

  // Преобразуем Router ошибку в стандартный Error объект
  const normalizedError = useMemo(() => {
    if (error instanceof Error) {
      Sentry.captureException(error);
      return error;
    }
    
    if (isRouteErrorResponse(error)) {
      const routerError = new Error(`${error.status} ${error.statusText}`);
      routerError.name = 'RouterError';
      Sentry.captureException(routerError);
      return routerError;
    }
    
    // Для неизвестных ошибок
    const unknownError = new Error(
      typeof error === 'string' ? error : 'Unknown router error'
    );
    unknownError.name = 'UnknownRouterError';
    Sentry.captureException(unknownError);
    return unknownError;
  }, [error]);

  // Определяем категорию ошибки для правильного отображения
  const getErrorCategory = (): 'chunk' | 'network' | 'runtime' | 'unknown' => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) return 'unknown'; // 404 показываем как unknown
      if (error.status >= 500) return 'network';  // 5xx как network
      return 'runtime'; // 4xx как runtime
    }
    
    if (normalizedError.message.includes('Loading chunk')) {
      return 'chunk';
    }
    
    return 'unknown';
  };

  const category = getErrorCategory();
  const recoverable = category === 'chunk' || category === 'network';

  // Логируем ошибку роутера в dev режиме
  if (__IS_DEV__) {
     
    console.group('🚨 RouterErrorBoundary - Router Error Caught');
     
    console.error('Original Router Error:', error);
     
    console.error('Normalized Error:', normalizedError);
     
    console.error('Category:', category, 'Recoverable:', recoverable);
     
    console.groupEnd();
  }

  // Просто отображаем ErrorPage - никакого дополнительного ErrorBoundary не нужно
  return (
    <ErrorPage 
      error={normalizedError}
      category={category}
      recoverable={recoverable}
      errorId={`router_${Date.now()}`}
    />
  );
};
