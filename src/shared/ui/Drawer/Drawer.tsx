import {
    memo, PointerEvent, ReactNode, useCallback, useEffect, useRef,
} from 'react';
import { MOTION_MS } from '@/shared/const/motion';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useReducedMotion } from '@/shared/lib/hooks/useReducedMotion';
import {
    AnimationProvider,
    useAnimationLibs,
} from '@/shared/lib/components/AnimationProvider';
import { Overlay } from '@/shared/ui/Overlay';
import { Portal } from '@/shared/ui/Portal';
import cls from './Drawer.module.scss';

interface DrawerProps {
    className?: string;
    children: ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
}

/** Отступ шторки от верха экрана (Mobile 6.37) */
const SHEET_TOP = 90;
const CLOSE_THRESHOLD = 0.5;
const FLICK_VELOCITY = 2;
/** CSS-переменная: на сколько клавиатура iOS перекрывает низ экрана */
const KEYBOARD_VAR = '--sheet-keyboard-offset';

const getSheetHeight = () => window.innerHeight - SHEET_TOP;

/** Открытые шторки по порядку открытия: Esc закрывает только верхнюю */
const openSheets: symbol[] = [];

/** Esc сначала закрывает попапы AntD внутри шторки (выпадающие списки, подтверждения) */
const hasOpenPopup = () => Boolean(document.querySelector(
    '.ant-select-dropdown:not(.ant-select-dropdown-hidden), '
    + '.ant-dropdown:not(.ant-dropdown-hidden), '
    + '.ant-popover:not(.ant-popover-hidden), '
    + '.ant-modal-wrap:not([style*="display: none"])',
));

/** Bottom-sheet: ручка, скрим, закрытие свайпом вниз, по скриму и Esc */
export const DrawerContent = memo((props: DrawerProps) => {
    const { Spring, Gesture } = useAnimationLibs();
    const { className, children, onClose, isOpen } = props;
    // Высота пересчитывается при каждом открытии: окно могло повернуться или измениться
    const heightRef = useRef(getSheetHeight());
    const closingRef = useRef(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    // Нажатие началось на скриме, а не в шторке
    const pressOnScrimRef = useRef(false);
    const [{ y }, api] = Spring.useSpring(() => ({ y: heightRef.current }));
    // Reduced motion: шторка не едет, а проявляется opacity за motion-instant
    const reduced = useReducedMotion();
    const [{ opacity }, fadeApi] = Spring.useSpring(() => ({ opacity: 1 }));
    // Скрим проявляется вместе с выездом шторки
    const scrimOpacity = Spring.to([y, opacity], (value: number, alpha: number) => (
        (1 - value / heightRef.current) * alpha
    ));

    const openDrawer = useCallback(() => {
        api.start({ y: 0, immediate: reduced });
    }, [api, reduced]);

    useEffect(() => {
        if (isOpen) {
            heightRef.current = getSheetHeight();
            closingRef.current = false;
            // Старт всегда снизу — даже если прошлый раз шторку закрыли снаружи без анимации
            api.set({ y: heightRef.current });
            if (reduced) {
                fadeApi.set({ opacity: 0 });
                fadeApi.start({ opacity: 1, config: { duration: MOTION_MS.instant } });
            }
            openDrawer();
        }
    }, [isOpen, openDrawer, api, fadeApi, reduced]);

    const close = useCallback((velocity = 0) => {
        // Повторный тап по скриму или ✕ во время анимации не должен вызвать onClose дважды
        if (closingRef.current) return;
        closingRef.current = true;
        if (reduced) {
            fadeApi.start({ opacity: 0, config: { duration: MOTION_MS.instant }, onResolve: onClose });

            return;
        }
        api.start({
            y: heightRef.current,
            immediate: false,
            config: { ...Spring.config.stiff, velocity },
            onResolve: onClose,
        });
    }, [api, fadeApi, reduced, Spring.config.stiff, onClose]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const id = Symbol('sheet');
        openSheets.push(id);

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || hasOpenPopup()) return;
            if (openSheets[openSheets.length - 1] === id) {
                close();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            openSheets.splice(openSheets.indexOf(id), 1);
        };
    }, [isOpen, close]);

    // iOS не сжимает layout viewport под клавиатуру — поднимаем низ шторки сами,
    // иначе кнопка «Сохранить» в футере остаётся под клавиатурой
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!isOpen || !viewport) {
            return undefined;
        }

        const update = () => {
            const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
            sheetRef.current?.style.setProperty(KEYBOARD_VAR, `${offset}px`);
        };

        update();
        viewport.addEventListener('resize', update);
        viewport.addEventListener('scroll', update);

        return () => {
            viewport.removeEventListener('resize', update);
            viewport.removeEventListener('scroll', update);
        };
    }, [isOpen]);

    // Тянется только ручка: контент шторки должен скроллиться
    const bind = Gesture.useDrag(
        ({
            last,
            velocity: [, vy],
            direction: [, dy],
            movement: [, my],
        }) => {
            if (last) {
                if (my > heightRef.current * CLOSE_THRESHOLD || (vy > FLICK_VELOCITY && dy > 0)) {
                    close();
                } else {
                    openDrawer();
                }
            } else {
                api.start({ y: my, immediate: true });
            }
        },
        {
            from: () => [0, y.get()],
            filterTaps: true,
            bounds: { top: 0 },
            rubberband: true,
        },
    );

    if (!isOpen) {
        return null;
    }

    // Клик по скриму закрывает, только если и нажатие было на скриме: тап по инпуту поднимает
    // клавиатуру, шторка съезжает, и click может прилететь уже в скрим
    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        pressOnScrimRef.current = !sheetRef.current?.contains(event.target as Node);
    };

    const handleOverlayClick = () => {
        if (pressOnScrimRef.current) close();
    };

    return (
        <Portal element={document.getElementById('app') ?? document.body}>
            <div className={classNames(cls.Drawer, [className])} onPointerDown={handlePointerDown}>
                <Spring.a.div style={{ opacity: scrimOpacity }}>
                    <Overlay className={cls.scrim} onClick={handleOverlayClick} />
                </Spring.a.div>
                <Spring.a.div
                    ref={sheetRef}
                    className={cls.sheet}
                    role="dialog"
                    aria-modal="true"
                    style={{ y, opacity }}
                >
                    <div className={cls.handleRow} {...bind()}>
                        <span className={cls.handle} />
                    </div>
                    {children}
                </Spring.a.div>
            </div>
        </Portal>
    );
});

DrawerContent.displayName = 'DrawerContent';

const DrawerAsync = (props: DrawerProps) => {
    const { isLoaded } = useAnimationLibs();

    if (!isLoaded) {
        return null;
    }

    return <DrawerContent {...props} />;
};

export const Drawer = (props: DrawerProps) => {
    return (
        <AnimationProvider>
            <DrawerAsync {...props} />
        </AnimationProvider>
    );
};
