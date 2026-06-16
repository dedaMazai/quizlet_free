import { useState, useRef, useCallback, useEffect, ChangeEvent, KeyboardEvent, RefObject } from 'react';

interface UseInlineEditOptions {
    initialValue: string;
    onSave: (newValue: string) => Promise<void>;
    validate?: (value: string) => string | null;
}

interface UseInlineEditReturn {
    isEditing: boolean;
    editValue: string;
    validationError: string | null;
    inputRef: RefObject<HTMLInputElement | null>;
    startEditing: () => void;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    handleBlur: () => void;
}

export const useInlineEdit = (options: UseInlineEditOptions): UseInlineEditReturn => {
    const { initialValue, onSave, validate } = options;

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(initialValue);
    const [validationError, setValidationError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isSavingRef = useRef(false);

    useEffect(() => {
        if (!isEditing) {
            setEditValue(initialValue);
        }
    }, [initialValue, isEditing]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const saveAndClose = useCallback(async (value: string) => {
        if (isSavingRef.current) return;

        const trimmed = value.trim();
        if (!trimmed || trimmed === initialValue.trim()) {
            setEditValue(initialValue);
            setValidationError(null);
            setIsEditing(false);
            return;
        }

        if (validate) {
            const error = validate(trimmed);
            if (error) {
                setValidationError(error);
                return;
            }
        }

        isSavingRef.current = true;
        try {
            await onSave(trimmed);
            setIsEditing(false);
        } catch {
            // RTK Query покажет ошибку, остаёмся в режиме редактирования
        } finally {
            isSavingRef.current = false;
        }
    }, [initialValue, onSave, validate]);

    const startEditing = useCallback(() => {
        setEditValue(initialValue);
        setValidationError(null);
        setIsEditing(true);
    }, [initialValue]);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
        if (validationError) setValidationError(null);
    }, [validationError]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveAndClose(editValue);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setEditValue(initialValue);
            setValidationError(null);
            setIsEditing(false);
        }
    }, [editValue, initialValue, saveAndClose]);

    const handleBlur = useCallback(() => {
        saveAndClose(editValue);
    }, [editValue, saveAndClose]);

    return {
        isEditing,
        editValue,
        validationError,
        inputRef,
        startEditing,
        handleChange,
        handleKeyDown,
        handleBlur,
    };
};
