import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
    window.addEventListener('online', onChange);
    window.addEventListener('offline', onChange);
    return () => {
        window.removeEventListener('online', onChange);
        window.removeEventListener('offline', onChange);
    };
};

const getSnapshot = () => navigator.onLine;

/** Есть ли сеть: navigator.onLine + события online/offline */
export const useOnlineStatus = (): boolean => useSyncExternalStore(subscribe, getSnapshot);
