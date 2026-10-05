import { Fragment, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './BackLink.module.scss';

export interface BackLinkItem {
    label: string;
    to?: string;
}

interface BackLinkProps {
    items: BackLinkItem[];
    className?: string;
}

/** Строка «‹ Раздел / Подраздел» над H1 на детальных страницах */
export const BackLink = memo(({ items, className }: BackLinkProps) => {
    const { t } = useTranslation();
    const backTo = [...items].reverse().find((item) => item.to)?.to;

    return (
        <nav className={classNames(cls.BackLink, [className])}>
            {backTo
                ? (
                    <Link to={backTo} className={cls.back} aria-label={t('Назад')}>
                        <ChevronLeft size={14} strokeWidth={1.5} />
                    </Link>
                )
                : <ChevronLeft size={14} strokeWidth={1.5} />}
            {items.map(({ label, to }, index) => (
                <Fragment key={label}>
                    {index > 0 && <span className={cls.separator}>/</span>}
                    {to ? <Link to={to} className={cls.link}>{label}</Link> : <span>{label}</span>}
                </Fragment>
            ))}
        </nav>
    );
});

BackLink.displayName = 'BackLink';
