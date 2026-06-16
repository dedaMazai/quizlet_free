import { createContext } from 'react';
import { Theme } from '@/shared/const/theme';

export interface ThemeContextProps {
    theme?: Theme;
    setTheme?: (theme: Theme) => void;
    isLoading?: boolean;
    error?: string | null;
}

export const ThemeContext = createContext<ThemeContextProps>({});
