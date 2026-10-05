import type { ToastApi } from './types';

let globalToast: ToastApi | null = null;

/** Вызывается ToastProvider — для кода вне React (например, rtkApi) */
export const setGlobalToast = (api: ToastApi | null): void => {
    globalToast = api;
};

/** null, пока ToastProvider не смонтирован */
export const getGlobalToast = (): ToastApi | null => globalToast;
