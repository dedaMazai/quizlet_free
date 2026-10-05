import { createContext, useContext } from 'react';
import type { ToastApi } from './types';

export const ToastContext = createContext<ToastApi | null>(null);

/** Тосты BACKLOG §3: снизу слева, ≤3 в стеке, 4 с (с действием — 6 с) */
export const useToast = (): ToastApi => {
    const api = useContext(ToastContext);
    if (!api) {
        throw new Error('useToast: нет ToastProvider выше по дереву');
    }
    return api;
};
