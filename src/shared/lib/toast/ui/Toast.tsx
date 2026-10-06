import {
    memo, useCallback, useEffect, useRef, useState,
} from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    CircleAlert, CircleCheck, Info, TriangleAlert, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { ToastItem, ToastTone } from '../model/types';
import cls from './Toast.module.scss';

const DURATION_MS = 4000;
const ACTION_DURATION_MS = 6000;
/** Запас на анимацию ухода: в фоновой вкладке animationend может не прийти */
const EXIT_FALLBACK_MS = 300;
const ICON_SIZE = 18;
const CLOSE_ICON_SIZE = 16;
const ICON_STROKE = 1.5;

const ICONS: Record<ToastTone, LucideIcon> = {
    [ToastTone.SUCCESS]: CircleCheck,
    [ToastTone.ERROR]: CircleAlert,
    [ToastTone.WARNING]: TriangleAlert,
    [ToastTone.INFO]: Info,
};

interface ToastProps {
    toast: ToastItem;
    onRemove: (id: number) => void;
}

/** Один тост: полоса цвета смысла, иконка, текст, опц. ghost-действие; пауза таймера при наведении */
export const Toast = memo(({ toast, onRemove }: ToastProps) => {
    const {
        id, tone, content, action, closable,
    } = toast;
    const { t } = useTranslation();
    const [leaving, setLeaving] = useState(false);
    const remainingRef = useRef(toast.duration ?? (action ? ACTION_DURATION_MS : DURATION_MS));
    const startedAtRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    // Идёт ли отсчёт: парные события наведения могут прийти не по порядку
    const runningRef = useRef(false);

    const startTimer = useCallback(() => {
        if (runningRef.current) return;
        runningRef.current = true;
        startedAtRef.current = Date.now();
        timerRef.current = setTimeout(() => setLeaving(true), remainingRef.current);
    }, []);

    const pauseTimer = useCallback(() => {
        if (!runningRef.current) return;
        runningRef.current = false;
        clearTimeout(timerRef.current);
        remainingRef.current -= Date.now() - startedAtRef.current;
    }, []);

    useEffect(() => {
        startTimer();
        return pauseTimer;
    }, [startTimer, pauseTimer]);

    const removedRef = useRef(false);
    const finish = useCallback(() => {
        if (removedRef.current) return;
        removedRef.current = true;
        onRemove(id);
    }, [id, onRemove]);

    useEffect(() => {
        if (!leaving) return undefined;
        const fallback = setTimeout(finish, EXIT_FALLBACK_MS);
        return () => clearTimeout(fallback);
    }, [leaving, finish]);

    const handleAction = () => {
        clearTimeout(timerRef.current);
        action?.onClick();
        setLeaving(true);
    };

    const handleClose = () => {
        clearTimeout(timerRef.current);
        setLeaving(true);
    };

    const Icon = ICONS[tone];

    return (
        <div
            role={tone === ToastTone.ERROR ? 'alert' : 'status'}
            className={classNames(cls.Toast, [cls[tone]], { [cls.leaving]: leaving })}
            onMouseEnter={leaving ? undefined : pauseTimer}
            onMouseLeave={leaving ? undefined : startTimer}
            onAnimationEnd={leaving ? finish : undefined}
        >
            <Icon aria-hidden className={cls.icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            <span className={cls.content}>{content}</span>
            {action && (
                <Button type="text" className={cls.action} onClick={handleAction}>
                    {action.label}
                </Button>
            )}
            {closable && (
                <Button
                    type="text"
                    className={cls.close}
                    aria-label={t('Закрыть')}
                    icon={<X aria-hidden size={CLOSE_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                    onClick={handleClose}
                />
            )}
        </div>
    );
});

Toast.displayName = 'Toast';
