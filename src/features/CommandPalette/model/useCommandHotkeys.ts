import { Dispatch, SetStateAction, useEffect } from 'react';

/** Открыта чужая модалка — палитра поверх неё не нужна */
const hasOpenModal = (): boolean => Array.from(document.querySelectorAll('.ant-modal-wrap'))
    .some((wrap) => getComputedStyle(wrap).display !== 'none');

const isTypingTarget = (target: EventTarget | null): boolean => target instanceof HTMLElement
    && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** ⌘K / Ctrl+K — открыть/закрыть палитру; «/» — открыть, если фокус не в поле ввода (BACKLOG §4) */
export const useCommandHotkeys = (open: boolean, setOpen: Dispatch<SetStateAction<boolean>>) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                if (!open && hasOpenModal()) return;
                e.preventDefault();
                setOpen((prev) => !prev);
                return;
            }
            if (e.key === '/' && !open && !e.metaKey && !e.ctrlKey && !e.altKey
                && !isTypingTarget(e.target) && !hasOpenModal()) {
                e.preventDefault();
                setOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, setOpen]);
};
