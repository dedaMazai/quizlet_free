import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Segmented } from 'antd';
import { useUserInfo } from '@/entities/User';
import { StatsPeriod, useGetStudyOverviewQuery } from '@/entities/Statistics';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { AccuracyTimeCards } from '@/widgets/AccuracyTimeCards';
import { StreakHeatmap } from '@/widgets/StreakHeatmap';
import { MasteryChart } from '@/widgets/MasteryChart';
import { DeckProgressList } from '@/widgets/DeckProgressList';
import cls from './ProgressPage.module.scss';

const ProgressPage = () => {
    const { t } = useTranslation();
    const user = useUserInfo();
    const [period, setPeriod] = useState<StatsPeriod>(StatsPeriod.YEAR);
    const { isMobile } = useMatchMedia();

    const tz = useMemo(
        () => user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        [user?.timezone],
    );

    const { data: overview, isLoading } = useGetStudyOverviewQuery(tz);
    // Пока сводка грузится, виджеты показывают скелетоны — пустое состояние не мелькает
    const showStats = isLoading || (overview?.totalAnswers ?? 0) > 0;

    return (
        <div className={cls.ProgressPage}>
            <PageHeader
                className={cls.header}
                title={t('Прогресс')}
                extra={showStats && (
                    <Segmented<StatsPeriod>
                        className={cls.period}
                        classNames={{ item: cls.periodItem, label: cls.periodLabel }}
                        value={period}
                        onChange={setPeriod}
                        options={[
                            // Мобильная 6.55 — сокращения
                            { label: isMobile ? t('Нед.') : t('Неделя'), value: StatsPeriod.WEEK },
                            { label: isMobile ? t('Мес.') : t('Месяц'), value: StatsPeriod.MONTH },
                            { label: t('Год'), value: StatsPeriod.YEAR },
                        ]}
                    />
                )}
            />

            {showStats ? (
                <>
                    <AccuracyTimeCards tz={tz} period={period} />
                    <StreakHeatmap tz={tz} />
                    <div className={cls.chartsGrid}>
                        <MasteryChart />
                        {/* Мобильная 6.55 — без списка колод */}
                        {!isMobile && <DeckProgressList tz={tz} />}
                    </div>
                </>
            ) : (
                <EmptyState
                    type="recent"
                    title={t('Пока нет данных для статистики')}
                    description={t('Пройдите заучивание, чтобы увидеть свой прогресс')}
                />
            )}
        </div>
    );
};

export default ProgressPage;
