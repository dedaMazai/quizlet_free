import { memo, MouseEvent, ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Blueprint } from '@/shared/ui/Blueprint';
import cls from './AnswerOption.module.scss';

export enum AnswerOptionState {
    IDLE = 'idle',
    /** Выбран клавиатурой */
    ACTIVE = 'active',
    /** Правильный ответ после проверки */
    CORRECT = 'correct',
    /** Выбранный неверный ответ */
    WRONG = 'wrong',
    /** Прочие варианты после проверки */
    DIM = 'dim',
}

const STATE_CLASSES: Record<AnswerOptionState, string | undefined> = {
    [AnswerOptionState.IDLE]: undefined,
    [AnswerOptionState.ACTIVE]: cls.active,
    [AnswerOptionState.CORRECT]: cls.correct,
    [AnswerOptionState.WRONG]: cls.wrong,
    [AnswerOptionState.DIM]: cls.dim,
};

const MARK_ICON_SIZE = 16;
const MARK_ICON_STROKE = 2;

interface AnswerOptionProps {
    /** Номер для выбора цифрой */
    index: number;
    label: ReactNode;
    state?: AnswerOptionState;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}

/** Вариант ответа: номер-клавиша и текст; после проверки — сигнальный цвет и ✓ / ✕ */
export const AnswerOption = memo((props: AnswerOptionProps) => {
    const {
        index, label, state = AnswerOptionState.IDLE, disabled, onClick, className,
    } = props;

    let mark: ReactNode = index;
    if (state === AnswerOptionState.CORRECT) {
        mark = <Check size={MARK_ICON_SIZE} strokeWidth={MARK_ICON_STROKE} aria-hidden />;
    } else if (state === AnswerOptionState.WRONG) {
        mark = <X size={MARK_ICON_SIZE} strokeWidth={MARK_ICON_STROKE} aria-hidden />;
    }

    return (
        <Blueprint
            as="button"
            // Клавиатура обслуживается хоткеями сессии: фокус на варианте давал бы двойной Enter
            tabIndex={-1}
            onMouseDown={(e: MouseEvent) => e.preventDefault()}
            aria-disabled={disabled}
            className={classNames(cls.AnswerOption, { [cls.locked]: disabled }, [className, STATE_CLASSES[state]])}
            onClick={disabled ? undefined : onClick}
        >
            <span className={cls.mark}>{mark}</span>
            <span className={cls.label}>{label}</span>
        </Blueprint>
    );
});

AnswerOption.displayName = 'AnswerOption';
