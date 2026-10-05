import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useOnlineStatus } from '@/shared/lib/hooks/useOnlineStatus';
import cls from './NetworkBanner.module.scss';

/** Запас на анимацию ухода: в фоновой вкладке animationend может не прийти */
const EXIT_FALLBACK_MS = 300;
const ICON_SIZE = 18;
const ICON_STROKE = 1.5;

interface NetworkBannerProps {
    className?: string;
}

/** Плашка во всю ширину над контентом, пока нет сети (BACKLOG §3) */
export const NetworkBanner = memo(({ className }: NetworkBannerProps) => {
    const { t } = useTranslation();
    const isOnline = useOnlineStatus();
    // Плашка остаётся на время анимации ухода после возврата сети
    const [shown, setShown] = useState(!isOnline);
    if (!isOnline && !shown) setShown(true);

    useEffect(() => {
        if (!isOnline || !shown) return undefined;
        const fallback = setTimeout(() => setShown(false), EXIT_FALLBACK_MS);
        return () => clearTimeout(fallback);
    }, [isOnline, shown]);

    if (!shown) return null;

    return (
        <div
            role="status"
            className={classNames(cls.NetworkBanner, [className], { [cls.leaving]: isOnline })}
            onAnimationEnd={() => {
                if (isOnline) setShown(false);
            }}
        >
            <WifiOff aria-hidden className={cls.icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            {t('Нет соединения — изменения не сохранятся, пока сеть не вернётся')}
        </div>
    );
});

NetworkBanner.displayName = 'NetworkBanner';
