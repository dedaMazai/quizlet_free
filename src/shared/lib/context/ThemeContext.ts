import { createContext } from 'react';
import { Theme, ThemeMode } from '@/shared/const/theme';

export interface ThemeContextProps {
    theme?: Theme;
    setTheme?: (theme: Theme) => void;
    mode?: ThemeMode;
    setMode?: (mode: ThemeMode) => void;
    isLoading?: boolean;
    error?: string | null;
}

export const ThemeContext = createContext<ThemeContextProps>({});
