import { useCallback, useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => void;

/**
 * useDebounce - хук для дебаунсинга функций
 * @param callback - функция для дебаунсинга
 * @param delay - задержка в миллисекундах (по умолчанию 300)
 * @returns дебаунсированная функция
 */
export function useDebounce<T extends AnyFunction>(
    callback: T,
    delay: number = 300,
): (...args: Parameters<T>) => void {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef<T>(callback);

    // Обновляем ref при изменении callback
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
    }, []);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            timer.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay],
    );
}
