import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './Flex.module.scss';

export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around';
export type FlexAlign = 'start' | 'center' | 'end';
export type FlexDirection = 'row' | 'column';
export type FlexGap = '2' | '4' | '8' | '6' | '10'| '12' | '14' | '16' | '20' | '24' | '32'| '48' | '64';

const justifyClasses: Record<FlexJustify, string> = {
    start: cls.justifyStart,
    center: cls.justifyCenter,
    end: cls.justifyEnd,
    around: cls.justifyAround,
    between: cls.justifyBetween,
};

const alignClasses: Record<FlexAlign, string> = {
    start: cls.alignStart,
    center: cls.alignCenter,
    end: cls.alignEnd,
};

const directionClasses: Record<FlexDirection, string> = {
    row: cls.directionRow,
    column: cls.directionColumn,
};

const gapClasses: Record<FlexGap, string> = {
    2: cls.gap2,
    4: cls.gap4,
    8: cls.gap8,
    6: cls.gap6,
    10: cls.gap10,
    12: cls.gap12,
    14: cls.gap14,
    16: cls.gap16,
    20: cls.gap20,
    24: cls.gap24,
    32: cls.gap32,
    48: cls.gap48,
    64: cls.gap64,
};

type DivProps = DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
>;

export interface FlexProps extends DivProps {
    className?: string;
    children: ReactNode;
    justify?: FlexJustify;
    align?: FlexAlign;
    direction: FlexDirection;
    wrap?: boolean;
    gap?: FlexGap;
    max?: boolean;
    fullHeight?: boolean;
}

export const Flex = (props: FlexProps) => {
    const {
        className,
        children,
        justify = 'start',
        align = 'center',
        direction = 'row',
        wrap,
        gap,
        max,
        fullHeight,
        ...otherProps
    } = props;

    const classes = [
        className,
        justifyClasses[justify],
        alignClasses[align],
        directionClasses[direction],
        gap && gapClasses[gap],
    ];

    const mods: Record<string, boolean | undefined> = {
        [cls.wrap]: wrap,
        [cls.max]: max,
        [cls.fullHeight]: fullHeight,
    };

    return (
        <div className={classNames(cls.Flex, mods, classes)} {...otherProps}>
            {children}
        </div>
    );
};
