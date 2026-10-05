import { useCallback } from 'react';
import { LOCAL_STORAGE_SESSION_AUTO_SPEAK_KEY } from '@/shared/const/localstorage';
import { useLocalStorage } from './useLocalStorage';

/** Автопроизношение слова на фидбэке сессии (кнопка в топбаре) */
export const useAutoSpeak = () => {
    const [autoSpeak, setAutoSpeak] = useLocalStorage(LOCAL_STORAGE_SESSION_AUTO_SPEAK_KEY, true);
    const toggle = useCallback(() => setAutoSpeak((value) => !value), [setAutoSpeak]);

    return { autoSpeak, toggleAutoSpeak: toggle };
};
