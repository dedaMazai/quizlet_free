import {
    ButtonHTMLAttributes, ElementType, HTMLAttributes, memo, ReactNode,
} from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Blueprint } from '@/shared/ui/Blueprint';
import cls from './AccentPanel.module.scss';

interface AccentPanelProps extends HTMLAttributes<HTMLElement>,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled'> {
    as?: ElementType;
    className?: string;
    children?: ReactNode;
}

/** Тёмное поле accent-900 с метками Blueprint — один главный блок на экран */
export const AccentPanel = memo((props: AccentPanelProps) => {
    const { className, children, ...rest } = props;

    return (
        <Blueprint className={classNames(cls.AccentPanel, [className])} {...rest}>
            {children}
        </Blueprint>
    );
});

AccentPanel.displayName = 'AccentPanel';
