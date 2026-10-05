import { useEffect, useRef } from 'react';

interface UseKeyDownOptions {
    enabled?: boolean;
    /** Не реагировать, пока фокус в поле ввода */
    ignoreInputs?: boolean;
}

const isTypingTarget = (target: EventTarget | null) => target instanceof HTMLElement
    && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

/** Enter и пробел на сфокусированной кнопке браузер и так превратит в клик */
const isNativeActivation = (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ')
    && e.target instanceof HTMLElement
    && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A');

/** Глобальный keydown; автоповтор удерживаемой клавиши игнорируется */
export const useKeyDown = (handler: (e: KeyboardEvent) => void, options: UseKeyDownOptions = {}) => {
    const { enabled = true, ignoreInputs = true } = options;
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        if (!enabled) return undefined;
        const listener = (e: KeyboardEvent) => {
            if (e.repeat || e.defaultPrevented) return;
            if (ignoreInputs && isTypingTarget(e.target)) return;
            if (isNativeActivation(e)) return;
            handlerRef.current(e);
        };
        document.addEventListener('keydown', listener);
        return () => document.removeEventListener('keydown', listener);
    }, [enabled, ignoreInputs]);
};
