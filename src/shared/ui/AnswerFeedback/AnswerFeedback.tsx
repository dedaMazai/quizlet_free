import { memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, TriangleAlert, X } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useAutoAdvance } from '@/shared/lib/hooks/useAutoAdvance';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';
import cls from './AnswerFeedback.module.scss';

export enum AnswerFeedbackTone {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
}

const ICON_SIZE = 18;
const ICON_STROKE = 2;

const ICONS: Record<AnswerFeedbackTone, ReactNode> = {
    [AnswerFeedbackTone.SUCCESS]: <Check size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />,
    [AnswerFeedbackTone.ERROR]: <X size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />,
    [AnswerFeedbackTone.WARNING]: <TriangleAlert size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />,
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

    useAutoAdvance(autoAdvance, onNext);
    useKeyDown((e) => {
        if (e.key === 'Enter') onNext();
    });

    return (
        <div role="status" className={classNames(cls.AnswerFeedback, [className, cls[tone]])}>
            <span className={cls.icon}>{ICONS[tone]}</span>
            <div className={cls.text}>
                <span className={cls.title}>{title}</span>
                {subtitle && <span className={cls.subtitle}>{subtitle}</span>}
            </div>
            <div className={cls.next}>
                <button type="button" className={cls.nextBtn} onClick={onNext}>
                    {t('Дальше · ENTER')}
                </button>
                {autoAdvance && (
                    <div className={cls.timer}>
                        <i className={cls.timerFill} />
                    </div>
                )}
            </div>
        </div>
    );
});

AnswerFeedback.displayName = 'AnswerFeedback';
