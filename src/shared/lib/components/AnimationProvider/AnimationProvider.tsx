import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

type SpringType = typeof import('@react-spring/web');
type GestureType = typeof import('@use-gesture/react');

interface AnimationContextPayload {
    Gesture?: GestureType;
    Spring?: SpringType;
    isLoaded?: boolean;
}

const AnimationContext = createContext<AnimationContextPayload>({});

/** Флаг в sessionStorage: перезагрузка из-за недогрузившегося чанка уже была — не зацикливаемся */
const RELOAD_FLAG = 'animation-chunk-reload';

// Обе либы зависят друг от друга
const getAsyncAnimationModules = async () => {
    return Promise.all([
        import('@react-spring/web'),
        import('@use-gesture/react'),
    ]);
};

export const useAnimationLibs = () => {
    return useContext(AnimationContext) as Required<AnimationContextPayload>;
};

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
    const SpringRef = useRef<SpringType | undefined>(undefined);
    const GestureRef = useRef<GestureType | undefined>(undefined);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Без либ шторка рендерит null и кнопка «ничего не делает». Чанк не грузится
        // обычно из-за устаревшего кеша WebView (Telegram) после деплоя: повторяем,
        // затем один раз перезагружаем страницу за свежим index.html
        getAsyncAnimationModules()
            .catch(getAsyncAnimationModules)
            .then(([Spring, Gesture]) => {
                SpringRef.current = Spring;
                GestureRef.current = Gesture;
                setIsLoaded(true);
                sessionStorage.removeItem(RELOAD_FLAG);
            })
            .catch(() => {
                if (sessionStorage.getItem(RELOAD_FLAG)) return;
                sessionStorage.setItem(RELOAD_FLAG, '1');
                window.location.reload();
            });
    }, []);

    const value = useMemo(
        () => ({
            Gesture: GestureRef.current,
            Spring: SpringRef.current,
            isLoaded,
        }),
        [isLoaded],
    );

    return (
        <AnimationContext.Provider value={value}>
            {children}
        </AnimationContext.Provider>
    );
};
