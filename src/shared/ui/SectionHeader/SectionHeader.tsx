import { memo, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './SectionHeader.module.scss';

export enum SectionHeaderSize {
    /** 22px */
    SM = 'sm',
    /** 24px */
    MD = 'md',
    /** 26px */
    LG = 'lg',
}

interface SectionHeaderProps {
    title: ReactNode;
    /** Сразу за заголовком, до линии: переключатель фильтра */
    titleExtra?: ReactNode;
    /** Справа от линии: подпись или ссылка */
    extra?: ReactNode;
    size?: SectionHeaderSize;
    className?: string;
}

/** H2 секции + линия справа (flex:1, 1px divider) */
export const SectionHeader = memo((props: SectionHeaderProps) => {
    const {
        title,
        titleExtra,
        extra,
        size = SectionHeaderSize.MD,
        className,
    } = props;

    return (
        <div className={classNames(cls.SectionHeader, [className])}>
            <h2 className={classNames(cls.title, [cls[size]])}>{title}</h2>
            {titleExtra}
            <div className={cls.line} />
            {extra}
        </div>
    );
});

SectionHeader.displayName = 'SectionHeader';
