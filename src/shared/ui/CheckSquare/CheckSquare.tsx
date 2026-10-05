import { memo } from 'react';
import { Check } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './CheckSquare.module.scss';

const ICON_SIZE = 12;
const ICON_STROKE = 2.2;

interface CheckSquareProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** Подпись для скринридера: что выбирается */
    label: string;
    className?: string;
}

/** Квадратный чекбокс 18×18 строки выбора в модалках ИИ (Modals 6.28–6.29) */
export const CheckSquare = memo((props: CheckSquareProps) => {
    const {
        checked, onChange, label, className,
    } = props;

    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={label}
            className={classNames(cls.CheckSquare, [className], { [cls.checked]: checked })}
            onClick={() => onChange(!checked)}
        >
            {checked && <Check aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        </button>
    );
});

CheckSquare.displayName = 'CheckSquare';
