import {
    useCallback, useEffect, useRef, useState,
} from 'react';
import type { ReactNode } from 'react';
import { useToast } from './ToastContext';

/** Окно отмены = время жизни тоста с действием (BACKLOG §3) */
const UNDO_WINDOW_MS = 6000;

interface UndoableDeleteOptions {
    /** Сам запрос удаления — уходит, только когда истекли 6 с без «Отменить» */
    onCommit: (id: string) => Promise<unknown>;
    /** Запрос не прошёл — элемент уже вернулся в список */
    onError?: () => void;
}

interface UndoableDeleteResult {
    /** Скрытые до подтверждения элементы — отфильтровать из списка */
    hiddenIds: ReadonlySet<string>;
    /** Скрыть сразу и показать тост с «Отменить» */
    remove: (id: string, message: ReactNode, undoLabel: string) => void;
}

interface PendingDelete {
    timer: ReturnType<typeof setTimeout>;
    toastId: number;
}

/**
 * Удаление с отменой: элемент скрывается сразу, мутация уходит через 6 с.
 * Таймер живёт здесь, а не в тосте: вытеснение тоста из стека или пауза при наведении
 * не сдвигают момент удаления.
 */
export const useUndoableDelete = ({ onCommit, onError }: UndoableDeleteOptions): UndoableDeleteResult => {
    const toast = useToast();
    const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(() => new Set());
    const pendingRef = useRef(new Map<string, PendingDelete>());
    const callbacksRef = useRef({ onCommit, onError });
    callbacksRef.current = { onCommit, onError };

    const restore = useCallback((id: string) => {
        setHiddenIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const commit = useCallback(async (id: string) => {
        const pending = pendingRef.current.get(id);
        if (!pending) return;
        pendingRef.current.delete(id);
        clearTimeout(pending.timer);
        // «Отменить» после подтверждения уже ничего не вернёт — убираем тост
        toast.dismiss(pending.toastId);
        try {
            await callbacksRef.current.onCommit(id);
        } catch {
            restore(id);
            callbacksRef.current.onError?.();
        }
    }, [toast, restore]);

    const undo = useCallback((id: string) => {
        const pending = pendingRef.current.get(id);
        if (!pending) return;
        pendingRef.current.delete(id);
        clearTimeout(pending.timer);
        restore(id);
    }, [restore]);

    const remove = useCallback((id: string, message: ReactNode, undoLabel: string) => {
        if (pendingRef.current.has(id)) return;
        setHiddenIds((prev) => new Set(prev).add(id));
        const toastId = toast.success(message, {
            action: { label: undoLabel, onClick: () => undo(id) },
        });
        const timer = setTimeout(() => commit(id), UNDO_WINDOW_MS);
        pendingRef.current.set(id, { timer, toastId });
    }, [toast, undo, commit]);

    // Ушли со страницы — отменять уже негде: подтверждаем сразу
    useEffect(() => {
        const pending = pendingRef.current;
        return () => {
            [...pending.keys()].forEach((id) => commit(id));
        };
    }, [commit]);

    return { hiddenIds, remove };
};
