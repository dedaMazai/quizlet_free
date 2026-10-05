import { memo } from 'react';
import { Button } from 'antd';
import type { LucideIcon } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import cls from './EmptyState.module.scss';

const ICON_SIZE = 32;
const ICON_STROKE = 1.25;

export enum EmptyStateAlign {
    /** По левому краю — в контенте */
    START = 'start',
    /** По центру — в фокус-режиме */
    CENTER = 'center',
}

export interface EmptyStateAction {
    label: string;
    onClick: () => void;
}

interface EmptyStateProps {
    icon: LucideIcon;
    kicker: string;
    title: string;
    /** Одна строка пояснения */
    description?: string;
    primary?: EmptyStateAction;
    /** Ghost-действие рядом с primary */
    secondary?: EmptyStateAction;
    align?: EmptyStateAlign;
    className?: string;
}

/** Пустое состояние (BACKLOG §1): иконка в рамке, kicker, заголовок, строка пояснения, одно primary-действие */
export const EmptyState = memo((props: EmptyStateProps) => {
    const {
        icon: Icon,
        kicker,
        title,
        description,
        primary,
        secondary,
        align = EmptyStateAlign.START,
        className,
    } = props;

    return (
        <section
            className={classNames(cls.EmptyState, [className], { [cls.center]: align === EmptyStateAlign.CENTER })}
        >
            <span className={cls.icon}>
                <Icon aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </span>
            <Kicker size={KickerSize.MD} className={cls.kicker}>{kicker}</Kicker>
            <h2 className={cls.title}>{title}</h2>
            {description && <p className={cls.description}>{description}</p>}
            {(primary || secondary) && (
                <div className={cls.actions}>
                    {primary && (
                        <Button type="primary" className={cls.primary} onClick={primary.onClick}>
                            <BlueprintMarks />
                            {primary.label}
                        </Button>
                    )}
                    {secondary && (
                        <Button type="link" className={cls.secondary} onClick={secondary.onClick}>
                            {secondary.label}
                        </Button>
                    )}
                </div>
            )}
        </section>
    );
});

EmptyState.displayName = 'EmptyState';
