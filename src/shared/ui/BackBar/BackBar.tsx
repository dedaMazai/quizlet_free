import { memo, ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './BackBar.module.scss';

const BACK_ICON_SIZE = 20;
const ICON_STROKE = 1.5;

interface BackBarProps {
    /** Куда ведёт «‹ Раздел» */
    to: string;
    label: ReactNode;
    /** Кнопки 44×44 справа: «+», «…» */
    actions?: ReactNode;
    className?: string;
}

/** Мобильная полоса возврата на детальных экранах (Mobile 6.36, 6.41, 6.52) */
export const BackBar = memo((props: BackBarProps) => {
    const {
        to, label, actions, className,
    } = props;

    return (
        <div className={classNames(cls.BackBar, [className])}>
            <Link to={to} className={cls.back}>
                <ChevronLeft aria-hidden size={BACK_ICON_SIZE} strokeWidth={ICON_STROKE} />
                {label}
            </Link>
            {actions && <div className={cls.actions}>{actions}</div>}
        </div>
    );
});

BackBar.displayName = 'BackBar';
