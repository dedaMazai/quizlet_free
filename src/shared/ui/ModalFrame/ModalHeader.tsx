import { memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { Sparkles, X } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import cls from './ModalFrame.module.scss';

const QUOTA_ICON_SIZE = 13;
const CLOSE_ICON_SIZE = 18;
const ICON_STROKE = 1.5;

interface ModalHeaderProps {
    /** Кикер над заголовком: имя колоды */
    kicker?: ReactNode;
    title: ReactNode;
    /** Бейдж квоты ИИ: «ОСТАЛОСЬ 17» */
    quota?: ReactNode;
    onClose: () => void;
    className?: string;
}

/** Шапка модалки: кикер, заголовок, бейдж квоты, закрытие (Modals 6.27–6.30) */
export const ModalHeader = memo((props: ModalHeaderProps) => {
    const {
        kicker, title, quota, onClose, className,
    } = props;
    const { t } = useTranslation();

    return (
        <div className={classNames(cls.header, [className])}>
            <div className={cls.headings}>
                {kicker && <Kicker size={KickerSize.SM}>{kicker}</Kicker>}
                <span className={cls.title}>{title}</span>
            </div>
            {quota !== undefined && (
                <span className={cls.quota}>
                    <Sparkles aria-hidden size={QUOTA_ICON_SIZE} strokeWidth={ICON_STROKE} />
                    {quota}
                </span>
            )}
            <Button
                type="text"
                className={cls.close}
                aria-label={t('Закрыть')}
                icon={<X aria-hidden size={CLOSE_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                onClick={onClose}
            />
        </div>
    );
});

ModalHeader.displayName = 'ModalHeader';
