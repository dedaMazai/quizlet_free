import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, QRCode } from 'antd';
import { X } from 'lucide-react';
import { useGetTelegramLinkQuery } from '@/entities/User';
import { ReactComponent as TelegramIcon } from '@/shared/assets/icons/Telegram.svg';
import { LOCAL_STORAGE_TELEGRAM_PROMO_DISMISSED_KEY } from '@/shared/const/localstorage';
import { TELEGRAM_APP_URL } from '@/shared/const/telegram';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { isTelegramMiniApp } from '@/shared/lib/telegram';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import { TelegramButton, TelegramButtonVariant } from '@/shared/ui/TelegramButton';

import cls from './TelegramPromo.module.scss';

const CLOSE_SIZE = 16;
const QR_SIZE = 88;
/** Атрибут fill в SVG не понимает var(): цвета QR — как у --color-text/--color-bg светлой темы */
const QR_COLOR = '#1d1f20';
const QR_BG = '#ffffff';

interface TelegramPromoProps {
    className?: string;
}

/** Карточка «Zubrika в Telegram» на главной: пока Telegram не привязан и её не скрыли крестиком */
export const TelegramPromo = memo(({ className }: TelegramPromoProps) => {
    const { t } = useTranslation();
    const inTelegram = isTelegramMiniApp();
    const [dismissed, setDismissed] = useLocalStorage(LOCAL_STORAGE_TELEGRAM_PROMO_DISMISSED_KEY, false);
    const { data: telegramLink, isSuccess } = useGetTelegramLinkQuery(undefined, { skip: inTelegram || dismissed });

    const dismiss = useCallback(() => setDismissed(true), [setDismissed]);

    if (inTelegram || dismissed || !isSuccess || telegramLink) {
        return null;
    }

    return (
        <Blueprint as="section" className={classNames(cls.TelegramPromo, [className])}>
            <span className={cls.badge}>
                <TelegramIcon className={cls.badgeIcon} aria-hidden />
            </span>
            <div className={cls.text}>
                <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>{t('Telegram')}</Kicker>
                <h2 className={cls.title}>{t('Учите слова в Telegram')}</h2>
                <p className={cls.body}>
                    {t('Повторения в дороге — прямо в чате, без установки. Войдите там один раз по почте, и прогресс будет общим.')}
                </p>
            </div>
            <TelegramButton variant={TelegramButtonVariant.BRAND} className={cls.cta} />
            <div className={cls.qr}>
                <QRCode value={TELEGRAM_APP_URL} type="svg" size={QR_SIZE} color={QR_COLOR} bgColor={QR_BG} bordered={false} />
            </div>
            <Button
                type="text"
                size="small"
                className={cls.close}
                icon={<X size={CLOSE_SIZE} aria-hidden />}
                aria-label={t('Скрыть')}
                onClick={dismiss}
            />
        </Blueprint>
    );
});

TelegramPromo.displayName = 'TelegramPromo';
