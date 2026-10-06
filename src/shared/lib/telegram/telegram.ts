import type { TelegramWebApp } from './types';

// SDK подключается в index.html только при запуске из Telegram,
// поэтому на сайте window.Telegram отсутствует.
export const getTelegramWebApp = (): TelegramWebApp | null => window.Telegram?.WebApp ?? null;

/** Приложение открыто как Telegram Mini App (есть подписанные данные запуска). */
export const isTelegramMiniApp = (): boolean => Boolean(getTelegramWebApp()?.initData);

export const getTelegramInitData = (): string => getTelegramWebApp()?.initData ?? '';

export const initTelegramWebApp = () => {
    const webApp = getTelegramWebApp();
    if (!webApp?.initData) return;

    webApp.ready();
    webApp.expand();
    // Вертикальный свайп иначе сворачивает приложение — мешает свайпам карточек
    webApp.disableVerticalSwipes?.();
};
