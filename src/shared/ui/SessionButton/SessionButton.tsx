import { memo, ReactNode } from 'react';
import { Button } from 'antd';
import { classNames } from '@/shared/lib/classNames/classNames';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { KeyHint, KeyHintTone } from '@/shared/ui/KeyHint';
import cls from './SessionButton.module.scss';

export enum SessionButtonVariant {
    /** accent + метки Blueprint */
    PRIMARY = 'primary',
    /** рамка divider */
    SECONDARY = 'secondary',
    /** текст accent без рамки */
    GHOST = 'ghost',
}

export enum SessionButtonSize {
    /** 44px */
    MD = 'md',
    /** 48px */
    LG = 'lg',
}

interface SessionButtonProps {
    variant?: SessionButtonVariant;
    size?: SessionButtonSize;
    /** Клавиша справа от подписи: «ENTER» */
    keyHint?: string;
    icon?: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    children: ReactNode;
}

const VARIANT_CLASSES: Record<SessionButtonVariant, string | undefined> = {
    [SessionButtonVariant.PRIMARY]: cls.primary,
    [SessionButtonVariant.SECONDARY]: undefined,
    [SessionButtonVariant.GHOST]: cls.ghost,
};

const ANTD_TYPES = {
    [SessionButtonVariant.PRIMARY]: 'primary',
    [SessionButtonVariant.SECONDARY]: 'default',
    [SessionButtonVariant.GHOST]: 'link',
} as const;

/** Кнопка действия на экранах занятия и итога */
export const SessionButton = memo((props: SessionButtonProps) => {
    const {
        variant = SessionButtonVariant.PRIMARY,
        size = SessionButtonSize.LG,
        keyHint,
        icon,
        disabled,
        onClick,
        className,
        children,
    } = props;
    const isPrimary = variant === SessionButtonVariant.PRIMARY;

    return (
        <Button
            type={ANTD_TYPES[variant]}
            disabled={disabled}
            onClick={onClick}
            className={classNames(cls.SessionButton, [className, VARIANT_CLASSES[variant], cls[size]])}
        >
            {isPrimary && <BlueprintMarks />}
            {children}
            {keyHint && (
                <KeyHint tone={isPrimary ? KeyHintTone.INHERIT : KeyHintTone.MUTED}>{keyHint}</KeyHint>
            )}
            {icon}
        </Button>
    );
});

SessionButton.displayName = 'SessionButton';
