import { useState, useCallback } from 'react';

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

/**
 * Hook для копирования текста в буфер обмена
 * @returns [copiedValue, copyFn] - последнее скопированное значение и функция копирования
 */
export const useCopyToClipboard = (): [CopiedValue, CopyFn] => {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);

    const copy: CopyFn = useCallback(async (text) => {
        if (!navigator?.clipboard) {
            console.warn('Clipboard API not supported');
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);

            // Сбрасываем состояние через 2 секунды
            setTimeout(() => {
                setCopiedText(null);
            }, 2000);

            return true;
        } catch (error) {
            console.warn('Copy to clipboard failed:', error);
            setCopiedText(null);
            return false;
        }
    }, []);

    return [copiedText, copy];
};

