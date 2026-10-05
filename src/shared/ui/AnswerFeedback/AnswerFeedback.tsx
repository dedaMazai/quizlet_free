import { memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Check, LucideIcon, TriangleAlert, X,
} from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useAutoAdvance } from '@/shared/lib/hooks/useAutoAdvance';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './AnswerFeedback.module.scss';

export enum AnswerFeedbackTone {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
}

const ICON_SIZE = 18;
const MOBILE_ICON_SIZE = 16;
const ICON_STROKE = 2;

const ICONS: Record<AnswerFeedbackTone, LucideIcon> = {
    [AnswerFeedbackTone.SUCCESS]: Check,
    [AnswerFeedbackTone.ERROR]: X,
    [AnswerFeedbackTone.WARNING]: TriangleAlert,
};

interface AnswerFeedbackProps {
    tone: AnswerFeedbackTone;
    title: ReactNode;
    subtitle?: ReactNode;
    onNext: () => void;
    /** Автопереход через 1,2 с с линией обратного отсчёта — только после верного ответа */
    autoAdvance?: boolean;
    className?: string;
}

/** Полоса результата ответа: иконка, вердикт с объяснением и «Дальше · ENTER» */
export const AnswerFeedback = memo((props: AnswerFeedbackProps) => {
    const {
        tone, title, subtitle, onNext, autoAdvance = false, className,
    } = props;
    const { t } = useTranslation();
    const { isMobile } = useMatchMedia();
    const Icon = ICONS[tone];

    useAutoAdvance(autoAdvance, onNext);
    useKeyDown((e) => {
        if (e.key === 'Enter') onNext();
    });

    const timer = autoAdvance && (
        <div className={cls.timer}>
            <i className={cls.timerFill} />
        </div>
    );

    // Мобильный: панель-колонка — иконка с вердиктом, пояснение, «Дальше» во всю ширину
    if (isMobile) {
        return (
            <div role="status" className={classNames(cls.AnswerFeedback, [className, cls[tone], cls.mobile])}>
                <div className={cls.mobileHead}>
                    <span className={cls.icon}><Icon size={MOBILE_ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden /></span>
                    <span className={cls.title}>{title}</span>
                </div>
                {subtitle && <span className={cls.subtitle}>{subtitle}</span>}
                <div className={cls.mobileNext}>
                    <button type="button" className={cls.nextBtn} onClick={onNext}>
                        {t('Дальше')}
                    </button>
                    {timer}
                </div>
            </div>
        );
    }

    return (
        <div role="status" className={classNames(cls.AnswerFeedback, [className, cls[tone]])}>
            <span className={cls.icon}><Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden /></span>
            <div className={cls.text}>
                <span className={cls.title}>{title}</span>
                {subtitle && <span className={cls.subtitle}>{subtitle}</span>}
            </div>
            <div className={cls.next}>
                <button type="button" className={cls.nextBtn} onClick={onNext}>
                    {t('Дальше · ENTER')}
                </button>
                {timer}
            </div>
        </div>
    );
});

AnswerFeedback.displayName = 'AnswerFeedback';
