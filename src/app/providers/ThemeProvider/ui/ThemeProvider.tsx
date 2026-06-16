import { ReactNode, useMemo } from 'react';
import { LOCAL_STORAGE_THEME_KEY } from '@/shared/const/localstorage';
import { Theme } from '@/shared/const/theme';
import { ThemeContext } from '@/shared/lib/context/ThemeContext';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { useUserSettingsTheme } from '@/entities/UserSettings';

interface ThemeProviderProps {
    initialTheme?: Theme;
    children: ReactNode;
    useApiIntegration?: boolean;
}

const ThemeProvider = (props: ThemeProviderProps) => {
    const { initialTheme = Theme.LIGHT, children, useApiIntegration = true } = props;
    const [localTheme, setLocalTheme] = useLocalStorage<Theme>(LOCAL_STORAGE_THEME_KEY, initialTheme);

    const {
        theme: apiTheme,
        setTheme: setApiTheme,
        isLoading,
        error
    } = useUserSettingsTheme();

    // Choose theme management strategy based on configuration
    const theme = useApiIntegration ? apiTheme : localTheme;
    const setTheme = useApiIntegration ? setApiTheme : setLocalTheme;

    const defaultProps = useMemo(
        () => ({
            theme,
            setTheme,
            isLoading: useApiIntegration ? isLoading : false,
            error: useApiIntegration ? error : null,
        }),
        [theme, setTheme, useApiIntegration, isLoading, error],
    );

    return (
        <ThemeContext.Provider value={defaultProps}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
