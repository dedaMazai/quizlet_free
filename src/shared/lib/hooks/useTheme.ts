import { useCallback, useContext } from 'react';
import { Theme, ThemeMode } from '@/shared/const/theme';
import { ThemeContext } from '../context/ThemeContext';

interface UseThemeResult {
    toggleTheme: (saveAction?: () => void) => void;
    theme: Theme;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    isLoading: boolean;
}

export function useTheme(): UseThemeResult {
    const {
        theme, setTheme, mode, setMode, isLoading,
    } = useContext(ThemeContext);

    const toggleTheme = useCallback((saveAction?: () => void) => {
        let newTheme: Theme;
        switch (theme) {
            case Theme.DARK:
                newTheme = Theme.LIGHT;
                break;
            case Theme.LIGHT:
                newTheme = Theme.DARK;
                break;
            default:
                newTheme = Theme.LIGHT;
        }
        setTheme?.(newTheme);

        saveAction?.();
    }, [setTheme, theme]);

    return {
        theme: theme || Theme.LIGHT,
        toggleTheme,
        mode: mode ?? ThemeMode.LIGHT,
        setMode: setMode ?? (() => undefined),
        isLoading: isLoading ?? false,
    };
}
