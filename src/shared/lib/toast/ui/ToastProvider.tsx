import {
    PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { ToastContext } from '../model/ToastContext';
import { setGlobalToast } from '../model/globalToast';
import {
    ToastApi, ToastItem, ToastOptions, ToastTone,
} from '../model/types';
import { Toast } from './Toast';
import cls from './Toast.module.scss';

/** Больше трёх — самый старый уходит */
const MAX_TOASTS = 3;

export const ToastProvider = ({ children }: PropsWithChildren) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    // Зеркало списка: новый стек считаем синхронно, без updater-функции setState
    const listRef = useRef<ToastItem[]>([]);
    const idRef = useRef(0);

    const commit = useCallback((next: ToastItem[]) => {
        listRef.current = next;
        setToasts(next);
    }, []);

    const dismiss = useCallback((id: number) => {
        commit(listRef.current.filter((toast) => toast.id !== id));
    }, [commit]);

    const show = useCallback((tone: ToastTone, content: ReactNode, options?: ToastOptions) => {
        idRef.current += 1;
        const id = idRef.current;
        const next = [...listRef.current, {
            id, tone, content, ...options,
        }];
        commit(next.slice(-MAX_TOASTS));
        return id;
    }, [commit]);

    const api = useMemo<ToastApi>(() => ({
        success: (content, options) => show(ToastTone.SUCCESS, content, options),
        error: (content, options) => show(ToastTone.ERROR, content, options),
        warning: (content, options) => show(ToastTone.WARNING, content, options),
        info: (content, options) => show(ToastTone.INFO, content, options),
        dismiss,
    }), [show, dismiss]);

    useEffect(() => {
        setGlobalToast(api);
        return () => setGlobalToast(null);
    }, [api]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            {createPortal(
                <div className={cls.ToastStack} aria-live="polite">
                    {toasts.map((toast) => (
                        <Toast key={toast.id} toast={toast} onRemove={dismiss} />
                    ))}
                </div>,
                document.body,
            )}
        </ToastContext.Provider>
    );
};
