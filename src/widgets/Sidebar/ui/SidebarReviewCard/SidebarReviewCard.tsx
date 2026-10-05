import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { AccentPanel } from '@/shared/ui/AccentPanel';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import { RoutePath } from '@/shared/config/router/routePath';
import { estimateReviewMinutes } from '@/shared/const/const';
import cls from './SidebarReviewCard.module.scss';

interface SidebarReviewCardProps {
    count: number;
}

/** Карточка «К повторению» внизу сайдбара (Shell 6.1) */
export const SidebarReviewCard = memo(({ count }: SidebarReviewCardProps) => {
    const { t } = useTranslation();

    return (
        <AccentPanel className={cls.SidebarReviewCard}>
            <Kicker size={KickerSize.SM} tone={KickerTone.ON_DARK}>
                {t('К повторению')}
            </Kicker>
            <div className={cls.stats}>
                <span className={cls.count}>{count}</span>
                <span className={cls.time}>
                    {t('≈ {{count}} мин', { count: estimateReviewMinutes(count) })}
                </span>
            </div>
            <Link to={RoutePath.REVIEW()} className={cls.action}>
                {t('Повторить')}
                <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
        </AccentPanel>
    );
});

SidebarReviewCard.displayName = 'SidebarReviewCard';
