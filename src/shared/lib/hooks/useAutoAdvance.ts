import { useEffect, useRef } from 'react';
import { AUTO_ADVANCE_MS } from '@/shared/const/session';

/** Через AUTO_ADVANCE_MS после включения `active` вызывает `onNext` */
export const useAutoAdvance = (active: boolean, onNext: () => void) => {
    const onNextRef = useRef(onNext);
    onNextRef.current = onNext;

    useEffect(() => {
        if (!active) return undefined;
        const timer = setTimeout(() => onNextRef.current(), AUTO_ADVANCE_MS);
        return () => clearTimeout(timer);
    }, [active]);
};
