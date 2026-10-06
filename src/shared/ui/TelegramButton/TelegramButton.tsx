import { memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonProps } from 'antd';
import { ReactComponent as TelegramIcon } from '@/shared/assets/icons/Telegram.svg';
import { TELEGRAM_APP_URL } from '@/shared/const/telegram';
import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './TelegramButton.module.scss';

export enum TelegramButtonVariant {
    /** Обычная кнопка с синей иконкой */
    DEFAULT = 'default',
    /** Залитая фирменным синим — главный призыв открыть бота */
    BRAND = 'brand',
}

interface TelegramButtonProps {
    variant?: TelegramButtonVariant;
    size?: ButtonProps['size'];
    block?: boolean;
    className?: string;
    children?: ReactNode;
}

// `default` — зарезервированное имя в CSS-модуле, поэтому классы вариантов названы явно
const VARIANT_CLASSES: Record<TelegramButtonVariant, string> = {
    [TelegramButtonVariant.DEFAULT]: cls.plain,
    [TelegramButtonVariant.BRAND]: cls.brand,
};

/** Ссылка на Mini App в Telegram, открывается в новой вкладке */
export const TelegramButton = memo((props: TelegramButtonProps) => {
    const {
        variant = TelegramButtonVariant.DEFAULT, size, block, className, children,
    } = props;
    const { t } = useTranslation();

    return (
        <Button
            href={TELEGRAM_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            size={size}
            block={block}
            icon={<TelegramIcon className={cls.icon} aria-hidden />}
            className={classNames(cls.TelegramButton, [className, VARIANT_CLASSES[variant]])}
        >
            {children ?? t('Открыть в Telegram')}
        </Button>
    );
});

TelegramButton.displayName = 'TelegramButton';
