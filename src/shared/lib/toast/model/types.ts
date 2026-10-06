import type { ReactNode } from 'react';

export enum ToastTone {
    /** «Результат» — success */
    SUCCESS = 'success',
    ERROR = 'error',
    /** «Срочно» — warning */
    WARNING = 'warning',
    /** Нейтральный — accent */
    INFO = 'info',
}

export interface ToastAction {
    label: string;
    onClick: () => void;
}

export interface ToastOptions {
    /** Ghost-действие справа, например «Отменить» */
    action?: ToastAction;
    /** Время показа, мс — для важных тостов, которые нельзя пропустить */
    duration?: number;
    /** Крестик для ручного закрытия */
    closable?: boolean;
}

export interface ToastItem extends ToastOptions {
    id: number;
    tone: ToastTone;
    content: ReactNode;
}

type ToastShow = (content: ReactNode, options?: ToastOptions) => number;

export interface ToastApi {
    success: ToastShow;
    error: ToastShow;
    warning: ToastShow;
    info: ToastShow;
    dismiss: (id: number) => void;
}
