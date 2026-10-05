import {
    createContext, ReactNode, useContext, useEffect, useMemo, useState,
} from 'react';

interface FocusModeContextValue {
    active: boolean;
    setActive: (active: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextValue>({
    active: false,
    setActive: () => {},
});

interface FocusModeProviderProps {
    children: ReactNode;
}

/** Фокус-режим без смены маршрута: страница просит оболочку спрятать сайдбар и шапку */
export const FocusModeProvider = ({ children }: FocusModeProviderProps) => {
    const [active, setActive] = useState(false);
    const value = useMemo(() => ({ active, setActive }), [active]);

    return <FocusModeContext.Provider value={value}>{children}</FocusModeContext.Provider>;
};

export const useFocusModeActive = () => useContext(FocusModeContext).active;

/** Включает фокус-режим, пока `active` истинно и компонент смонтирован */
export const useSetFocusMode = (active: boolean) => {
    const { setActive } = useContext(FocusModeContext);

    useEffect(() => {
        setActive(active);
        return () => setActive(false);
    }, [active, setActive]);
};
