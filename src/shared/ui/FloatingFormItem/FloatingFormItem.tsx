import { FC, ReactNode } from 'react';
import { Form, FormItemProps } from 'antd';
import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './FloatingFormItem.module.scss';

type FloatingFormItemVariant = 'vertical' | 'inline';

interface FloatingFormItemProps extends FormItemProps {
    className?: string;
    children: ReactNode;
    variant?: FloatingFormItemVariant;
}

/**
 * FloatingFormItem - Form.Item with floating label style
 * @param variant - 'vertical' (default) or 'inline' (label and control on same row)
 */
export const FloatingFormItem: FC<FloatingFormItemProps> = (props) => {
    const {
        className,
        children,
        variant = 'vertical',
        ...formItemProps
    } = props;

    return (
        <Form.Item
            className={classNames(cls.FloatingFormItem, [className], {
                [cls.inline]: variant === 'inline',
            })}
            {...formItemProps}
        >
            {children}
        </Form.Item>
    );
};
