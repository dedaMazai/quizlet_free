import React, { ErrorInfo, ReactNode, Suspense } from 'react';
import * as Sentry from "@sentry/react";
import { ErrorPage } from '@/widgets/ErrorPage';
import { PageLoader } from '@/widgets/PageLoader';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    boundaryName?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
    errorId?: string;
}

class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    private static generateErrorId(): string {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private static categorizeError(error: Error): {
        category: 'chunk' | 'network' | 'runtime' | 'unknown';
        severity: 'low' | 'medium' | 'high' | 'critical';
        recoverable: boolean;
    } {
        const message = error.message.toLowerCase();
        const stack = error.stack?.toLowerCase() || '';

        // Chunk loading errors
        if (
            message.includes('loading chunk') ||
            message.includes('chunkloaderror') ||
            error.name === 'ChunkLoadError'
        ) {
            return { category: 'chunk', severity: 'medium', recoverable: true };
        }

        // Network errors
        if (
            message.includes('network') ||
            message.includes('fetch') ||
            message.includes('timeout') ||
            error.name === 'NetworkError'
        ) {
            return { category: 'network', severity: 'medium', recoverable: true };
        }

        // Critical runtime errors
        if (
            message.includes('cannot read property') ||
            message.includes('undefined is not a function') ||
            message.includes('null is not an object') ||
            stack.includes('at render')
        ) {
            return { category: 'runtime', severity: 'high', recoverable: false };
        }

        return { category: 'unknown', severity: 'medium', recoverable: false };
    }

    private static reportError(error: Error, errorInfo: ErrorInfo, errorId: string, boundaryName?: string): void {
        const errorReport = {
            errorId,
            boundaryName,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...ErrorBoundary.categorizeError(error),
        };

        try {
            // Development logging
            if (__IS_DEV__) {
                 
                console.group('🚨 ErrorBoundary - Error Caught');
                 
                console.error('Error:', error);
                 
                console.error('Error Info:', errorInfo);
                 
                console.table(errorReport);
                 
                console.groupEnd();
            } else {
                // Production logging (less verbose)
                 
                console.error('ErrorBoundary:', {
                    errorId,
                    message: error.message,
                    boundaryName,
                });
            }

            Sentry.captureException(error, { extra: errorReport });

        } catch (reportingError) {
             
            console.warn('Failed to report error:', reportingError);
        }
    }

    private retryTimeoutId: NodeJS.Timeout | null = null;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            errorId: undefined,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        const errorId = ErrorBoundary.generateErrorId();

        if (__IS_DEV__) {
             
            console.log('🚨 ErrorBoundary.getDerivedStateFromError called:', {
                errorId,
                message: error.message,
                name: error.name,
            });
        }

        Sentry.captureException(error);

        return {
            hasError: true,
            error,
            errorId,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const { onError, boundaryName } = this.props;
        const { errorId } = this.state;

        // Debug logging
        if (__IS_DEV__) {
             
            console.log('🚨 ErrorBoundary.componentDidCatch called:', {
                errorId,
                boundaryName,
                message: error.message,
                componentStack: errorInfo.componentStack,
            });
        }

        // Store error info in state
        this.setState({ errorInfo });

        // Report error to Sentry with extra info
        Sentry.captureException(error, { extra: { ...errorInfo, errorId, boundaryName } });

        // Report error to custom logger if errorId exists
        if (errorId) {
            ErrorBoundary.reportError(error, errorInfo, errorId, boundaryName);
        }

        // Call custom error handler if provided
        if (onError) {
            try {
                onError(error, errorInfo);
            } catch (callbackError) {
                 
                console.error('Error in ErrorBoundary onError callback:', callbackError);
            }
        }
    }

    componentWillUnmount() {
        if (this.retryTimeoutId) {
            clearTimeout(this.retryTimeoutId);
        }
    }

    /**
     * Force page reload for critical errors
     */
    private handleReload = (): void => {
        window.location.reload();
    };

    render() {
        const { hasError, error, errorInfo, errorId } = this.state;
        const { children, fallback } = this.props;

        if (hasError && error) {
            // Use custom fallback if provided
            if (fallback) {
                return fallback;
            }

            // Enhanced error page with retry capabilities
            const { category, recoverable } = ErrorBoundary.categorizeError(error);
            
            return (
                <Suspense fallback={<PageLoader />}>
                    <ErrorPage 
                        error={error}
                        errorInfo={errorInfo}
                        errorId={errorId}
                        category={category}
                        recoverable={recoverable}
                        onReload={this.handleReload}
                    />
                </Suspense>
            );
        }

        return children;
    }
}

export { ErrorBoundary };
