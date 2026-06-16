import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';

/**
 * useDebounceState - хук для работы с состоянием и его дебаунсированной версией
 *
 * Используется для фильтров и поисковых полей, где нужно:
 * - Показывать мгновенное значение в UI (state)
 * - Отправлять API-запросы с задержкой (debouncedState)
 *
 * @param defaultState - начальное значение состояния
 * @param delay - задержка дебаунса в миллисекундах (по умолчанию 300)
 *
 * @returns [state, debouncedState, setImmediate, setWithDebounce]
 * - state: текущее значение (обновляется мгновенно)
 * - debouncedState: дебаунсированное значение (обновляется с задержкой)
 * - setImmediate: установить оба значения мгновенно (для select, reset)
 * - setWithDebounce: установить state мгновенно, debouncedState с задержкой (для текстового ввода)
 *
 * @example
 * const [filters, filtersDebounce, setFiltersField, debounceFilters] = useDebounceState<Filters>(initialFilters);
 *
 * // Для текстового ввода - используем debounceFilters
 * <Input onChange={(e) => debounceFilters({ ...filters, search: e.target.value })} />
 *
 * // Для select/reset - используем setFiltersField (мгновенное обновление)
 * <Select onChange={(value) => setFiltersField({ ...filters, status: value })} />
 */
export const useDebounceState = <T,>(defaultState: T, delay: number = 300) => {
    const [state, setState] = useState<T>(defaultState);
    const [debouncedState, setDebouncedState] = useState<T>(defaultState);

    const syncDebouncedState = useDebounce(() => setDebouncedState(state), delay);

    useEffect(() => {
      syncDebouncedState();
    }, [syncDebouncedState, state]);

    /** Установить оба значения мгновенно (для select, reset, initial load) */
    const setImmediate = useCallback((value: SetStateAction<T>) => {
      setState(value);
      setDebouncedState(value);
    }, []);

    /** Установить state мгновенно, debouncedState обновится с задержкой (для текстового ввода) */
    const setWithDebounce = useCallback((value: SetStateAction<T>) => {
      setState(value);
    }, []);

    return [state, debouncedState, setImmediate, setWithDebounce] as const;
};
