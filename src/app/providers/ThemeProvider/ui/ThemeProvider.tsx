import {
    ReactNode, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { LOCAL_STORAGE_THEME_FOLLOW_SYSTEM_KEY, LOCAL_STORAGE_THEME_KEY } from '@/shared/const/localstorage';
import { Theme, ThemeMode } from '@/shared/const/theme';
import { ThemeContext } from '@/shared/lib/context/ThemeContext';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { useUserSettingsTheme } from '@/entities/UserSettings';
import { getTelegramWebApp, isTelegramMiniApp } from '@/shared/lib/telegram';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

// В Telegram Mini App «системная» тема — тема Telegram, prefers-color-scheme там не совпадает с ней
const isSystemDark = () => (isTelegramMiniApp()
    ? getTelegramWebApp()?.colorScheme === 'dark'
    : window.matchMedia(DARK_SCHEME_QUERY).matches);

interface ThemeProviderProps {
    initialTheme?: Theme;
    children: ReactNode;
    useApiIntegration?: boolean;
}

const ThemeProvider = (props: ThemeProviderProps) => {
    const { initialTheme = Theme.LIGHT, children, useApiIntegration = true } = props;
    const [localTheme, setLocalTheme] = useLocalStorage<Theme>(LOCAL_STORAGE_THEME_KEY, initialTheme);
    // «Как в системе» (Настройки 6.25): тема следует prefers-color-scheme
    // В Telegram по умолчанию следуем его теме
    const [followSystem, setFollowSystem] = useLocalStorage<boolean>(
        LOCAL_STORAGE_THEME_FOLLOW_SYSTEM_KEY,
        isTelegramMiniApp(),
    );
    const [systemDark, setSystemDark] = useState(isSystemDark);

    const {
        theme: apiTheme,
        setTheme: setApiTheme,
        isLoading,
        error
    } = useUserSettingsTheme();

    // Choose theme management strategy based on configuration
    const theme = useApiIntegration ? apiTheme : localTheme;
    const applyTheme = useApiIntegration ? setApiTheme : setLocalTheme;

    useEffect(() => {
        const webApp = getTelegramWebApp();
        if (webApp && isTelegramMiniApp()) {
            const tgHandler = () => setSystemDark(webApp.colorScheme === 'dark');
            webApp.onEvent('themeChanged', tgHandler);
            return () => webApp.offEvent('themeChanged', tgHandler);
        }

        const media = window.matchMedia(DARK_SCHEME_QUERY);
        const handler = (event: MediaQueryListEvent) => setSystemDark(event.matches);
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, []);

    // Последний колбэк в ref: его identity меняется вместе с настройками с сервера,
    // и в зависимостях эффекта он перезапускал бы запись темы по кругу
    const applyThemeRef = useRef(applyTheme);
    useEffect(() => {
        applyThemeRef.current = applyTheme;
    }, [applyTheme]);

    // Тему применяем один раз на включение режима и на смену системной темы —
    // не при каждом изменении `theme`, иначе ответ сервера с другой темой зацикливает запись
    useEffect(() => {
        if (followSystem) {
            applyThemeRef.current(systemDark ? Theme.DARK : Theme.LIGHT);
        }
    }, [followSystem, systemDark]);

    // Явный выбор темы (переключатель в шапке, сегмент) отключает следование системе
    const setTheme = useCallback((newTheme: Theme) => {
        setFollowSystem(false);
        applyTheme(newTheme);
    }, [setFollowSystem, applyTheme]);

    const setMode = useCallback((mode: ThemeMode) => {
        if (mode === ThemeMode.SYSTEM) {
            setFollowSystem(true);
            return;
        }
        setTheme(mode === ThemeMode.DARK ? Theme.DARK : Theme.LIGHT);
    }, [setFollowSystem, setTheme]);

    const mode = useMemo(() => {
        if (followSystem) return ThemeMode.SYSTEM;
        return theme === Theme.DARK ? ThemeMode.DARK : ThemeMode.LIGHT;
    }, [followSystem, theme]);

    const defaultProps = useMemo(
        () => ({
            theme,
            setTheme,
            mode,
            setMode,
            isLoading: useApiIntegration ? isLoading : false,
            error: useApiIntegration ? error : null,
        }),
        [theme, setTheme, mode, setMode, useApiIntegration, isLoading, error],
    );

    return (
        <ThemeContext.Provider value={defaultProps}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
