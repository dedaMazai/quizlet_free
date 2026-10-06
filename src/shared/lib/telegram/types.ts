// Минимальный срез API Telegram Mini Apps, который использует приложение.
// https://core.telegram.org/bots/webapps#initializing-mini-apps

export interface TelegramWebAppUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
}

export type TelegramColorScheme = 'light' | 'dark';

export interface TelegramBackButton {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
}

export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        user?: TelegramWebAppUser;
    };
    colorScheme: TelegramColorScheme;
    ready: () => void;
    expand: () => void;
    disableVerticalSwipes?: () => void;
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    BackButton: TelegramBackButton;
    onEvent: (event: 'themeChanged', callback: () => void) => void;
    offEvent: (event: 'themeChanged', callback: () => void) => void;
}

declare global {
    interface Window {
        Telegram?: {
            WebApp?: TelegramWebApp;
        };
    }
}
