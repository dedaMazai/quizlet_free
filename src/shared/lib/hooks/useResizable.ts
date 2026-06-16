import { useCallback, useEffect, useRef, useState } from 'react';

interface UseResizableParams {
    initialWidth: number;
    minWidth: number;
    maxWidth: number;
    enabled: boolean;
    onResizeEnd?: (width: number) => void;
}

interface UseResizableReturn {
    width: number;
    isDragging: boolean;
    handleMouseDown: (e: React.MouseEvent) => void;
}

export const useResizable = (params: UseResizableParams): UseResizableReturn => {
    const { initialWidth, minWidth, maxWidth, enabled, onResizeEnd } = params;

    const [width, setWidth] = useState(initialWidth);
    const [isDragging, setIsDragging] = useState(false);

    const startXRef = useRef(0);
    const startWidthRef = useRef(0);
    const widthRef = useRef(width);
    const onResizeEndRef = useRef(onResizeEnd);
    onResizeEndRef.current = onResizeEnd;

    // Sync width when initialWidth changes externally (e.g. from localStorage on mount)
    useEffect(() => {
        setWidth(initialWidth);
        widthRef.current = initialWidth;
    }, [initialWidth]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!enabled) return;

        e.preventDefault();
        startXRef.current = e.clientX;
        startWidthRef.current = widthRef.current;
        setIsDragging(true);
    }, [enabled]);

    useEffect(() => {
        if (!isDragging) return;

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const handleMouseMove = (e: MouseEvent) => {
            const delta = e.clientX - startXRef.current;
            const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta));

            widthRef.current = newWidth;
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            onResizeEndRef.current?.(widthRef.current);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, minWidth, maxWidth]);

    return { width, isDragging, handleMouseDown };
};
