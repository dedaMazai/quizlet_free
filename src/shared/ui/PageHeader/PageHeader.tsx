import { memo, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { SectionTabs, SectionTabItem } from '@/shared/ui/SectionTabs';
import cls from './PageHeader.module.scss';

interface PageHeaderProps {
    title: ReactNode;
    /** Кнопки справа от H1 */
    extra?: ReactNode;
    tabs?: SectionTabItem[];
    className?: string;
}

/** H1 страницы (Condensed 44) с действиями справа и вкладками под ним */
export const PageHeader = memo((props: PageHeaderProps) => {
    const {
        title, extra, tabs, className,
    } = props;

    return (
        <div className={classNames(cls.PageHeader, [className])}>
            <div className={cls.titleRow}>
                <h1 className={cls.title}>{title}</h1>
                {extra && <div className={cls.extra}>{extra}</div>}
            </div>
            {!!tabs?.length && <SectionTabs items={tabs} />}
        </div>
    );
});

PageHeader.displayName = 'PageHeader';
