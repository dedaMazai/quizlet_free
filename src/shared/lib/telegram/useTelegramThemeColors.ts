import { useEffect } from 'react';
import { Theme } from '@/shared/const/theme';
import { getTelegramWebApp, isTelegramMiniApp } from './telegram';

/** Шапка и фон Telegram в цвет фона текущей темы (--color-bg выставляется при сборке antd-конфига). */
export const useTelegramThemeColors = (theme: Theme) => {
    useEffect(() => {
        const webApp = getTelegramWebApp();
        if (!webApp || !isTelegramMiniApp()) return;

        const color = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
        if (!color) return;

        webApp.setHeaderColor(color);
        webApp.setBackgroundColor(color);
    }, [theme]);
};
