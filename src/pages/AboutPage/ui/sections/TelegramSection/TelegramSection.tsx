import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCode } from 'antd';
import { Check } from 'lucide-react';
import previewEn from '@/shared/assets/img/telegram-preview-en.webp';
import previewRu from '@/shared/assets/img/telegram-preview-ru.webp';
import { AboutAnchor } from '@/shared/config/router/routePath';
import { TELEGRAM_APP_URL, TELEGRAM_BOT_USERNAME } from '@/shared/const/telegram';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';
import { TelegramButton, TelegramButtonVariant } from '@/shared/ui/TelegramButton';

import cls from './TelegramSection.module.scss';

const CHECK_SIZE = 18;
const QR_SIZE = 132;
/** Превью 540×960 показываем в половину — чётко на retina */
const SCREEN_WIDTH = 270;
const SCREEN_HEIGHT = 480;
/** QR рисуется на светлой плашке (--color-field-button-bg светлая в обеих темах): атрибут fill не понимает var() */
const QR_COLOR = '#1d2d3d';
const QR_BG = 'transparent';

/** Zubrika как Mini App в Telegram: те же колоды и повторения прямо в чате */
export const TelegramSection = memo(() => {
    const { t, i18n } = useTranslation();
    const preview = i18n.language.startsWith('en') ? previewEn : previewRu;

    const points = [
        t('Без установки — открывается прямо в чате'),
        t('Вход в один клик, без почты и пароля'),
        t('Уже есть аккаунт? Войдите один раз по почте — прогресс общий'),
    ];

    return (
        <section id={AboutAnchor.TELEGRAM} className={cls.TelegramSection}>
            <div className={cls.main}>
                <Kicker tone={KickerTone.ON_DARK}>{t('TELEGRAM MINI APP')}</Kicker>
                <h2 className={cls.title}>{t('Zubrika в Telegram')}</h2>
                <p className={cls.lead}>
                    {t('Те же колоды, режимы и повторения — в мессенджере, который всегда под рукой. Пять минут в дороге — и очередь на сегодня закрыта.')}
                </p>
                <ul className={cls.points}>
                    {points.map((point) => (
                        <li key={point} className={cls.point}>
                            <Check size={CHECK_SIZE} className={cls.check} aria-hidden />
                            {point}
                        </li>
                    ))}
                </ul>
                <div className={cls.actions}>
                    <TelegramButton variant={TelegramButtonVariant.BRAND} className={cls.cta} />
                    <span className={cls.username}>{`@${TELEGRAM_BOT_USERNAME}`}</span>
                </div>
            </div>
            <div className={cls.visual}>
                <img
                    src={preview}
                    alt={t('Zubrika в Telegram: карточка со словом')}
                    className={cls.screen}
                    loading="lazy"
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                />
                <figure className={cls.qr}>
                    <QRCode value={TELEGRAM_APP_URL} type="svg" size={QR_SIZE} color={QR_COLOR} bgColor={QR_BG} bordered={false} />
                    <figcaption className={cls.qrCaption}>{t('Наведите камеру телефона')}</figcaption>
                </figure>
            </div>
        </section>
    );
});

TelegramSection.displayName = 'TelegramSection';
