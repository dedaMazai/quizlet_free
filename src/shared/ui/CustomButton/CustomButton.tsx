import { FC, ReactNode } from 'react';
import { Button, ButtonProps } from 'antd';
import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './CustomButton.module.scss';

export type CustomButtonVariant = 'default' | 'delegate' | 'reject' | 'accept';

export interface CustomButtonProps extends Omit<ButtonProps, 'variant'> {
    /**
     * Вариант стиля кнопки
     * @default 'default'
     */
    variant?: CustomButtonVariant;
    /**
     * Иконка кнопки
     */
    icon?: ReactNode;
    /**
     * Позиция иконки
     * @default 'start'
     */
    iconPlacement?: 'start' | 'end';
    /**
     * Содержимое кнопки
     */
    children?: ReactNode;
    /**
     * Дополнительный класс
     */
    className?: string;
}

/**
 * CustomButton - кастомная кнопка с поддержкой различных вариантов стилей
 */
export const CustomButton: FC<CustomButtonProps> = (props) => {
    const {
        variant = 'default',
        icon,
        iconPlacement = 'start',
        children,
        className,
        ...restProps
    } = props;

    const variantClass = {
        default: cls.default,
        delegate: cls.delegate,
        reject: cls.reject,
        accept: cls.accept,
    }[variant];

    return (
        <Button
            className={classNames(cls.CustomButton, [variantClass, className])}
            icon={icon}
            iconPlacement={iconPlacement}
            {...restProps}
        >
            {children}
        </Button>
    );
};
