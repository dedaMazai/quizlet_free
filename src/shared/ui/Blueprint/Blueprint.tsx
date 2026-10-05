import { ElementType, HTMLAttributes, memo, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './Blueprint.module.scss';

export enum BlueprintCorners {
    /** color-mix(text 55%) — по умолчанию */
    DEFAULT = 'default',
    /** accent-400 — светлая кнопка на тёмном поле */
    LIGHT = 'light',
}

interface BlueprintProps extends HTMLAttributes<HTMLElement> {
    as?: ElementType;
    corners?: BlueprintCorners;
    className?: string;
    children?: ReactNode;
}

/** Рамка с метками «+» по углам (`.blueprint/.corner` в design/_ds/…/styles.css) */
export const Blueprint = memo((props: BlueprintProps) => {
    const {
        as: Tag = 'div',
        corners = BlueprintCorners.DEFAULT,
        className,
        children,
        ...rest
    } = props;

    const cornerCls = classNames(cls.corner, [cls[corners]]);

    return (
        <Tag className={classNames(cls.Blueprint, [className])} {...rest}>
            <i aria-hidden className={classNames(cornerCls, [cls.tl])} />
            <i aria-hidden className={classNames(cornerCls, [cls.tr])} />
            <i aria-hidden className={classNames(cornerCls, [cls.bl])} />
            <i aria-hidden className={classNames(cornerCls, [cls.br])} />
            {children}
        </Tag>
    );
});

Blueprint.displayName = 'Blueprint';
