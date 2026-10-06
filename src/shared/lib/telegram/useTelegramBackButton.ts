import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getTelegramWebApp, isTelegramMiniApp } from './telegram';

/** Нативная кнопка «Назад» Telegram: видна, когда в истории приложения есть куда вернуться. */
export const useTelegramBackButton = () => {
    // Подписка на смену маршрута — чтобы пересчитать canGoBack
    useLocation();
    const navigate = useNavigate();
    // react-router хранит номер записи истории в history.state.idx; на первой назад уходить некуда.
    // location.key не подходит: редирект с replace на старте выдаёт новый ключ без записи «назад».
    const historyIdx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    const canGoBack = historyIdx > 0;

    useEffect(() => {
        const webApp = getTelegramWebApp();
        if (!webApp || !isTelegramMiniApp()) return undefined;

        if (!canGoBack) {
            webApp.BackButton.hide();
            return undefined;
        }

        const goBack = () => navigate(-1);
        webApp.BackButton.onClick(goBack);
        webApp.BackButton.show();

        return () => webApp.BackButton.offClick(goBack);
    }, [canGoBack, navigate]);
};
