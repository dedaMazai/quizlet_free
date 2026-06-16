import { useCallback, useContext } from 'react';
import { Theme } from '@/shared/const/theme';
import { ThemeContext } from '../context/ThemeContext';

interface UseThemeResult {
    toggleTheme: (saveAction?: () => void) => void;
    theme: Theme;
    isLoading: boolean;
}

export function useTheme(): UseThemeResult {
    const { theme, setTheme, isLoading } = useContext(ThemeContext);

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
        isLoading: isLoading ?? false,
    };
}
