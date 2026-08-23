import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';
import { VStack } from '@/shared/ui/Stack';
import { useUserInfo } from '@/entities/User';
import { useGetStudyOverviewQuery } from '@/entities/Statistics';
import { EmptyState } from '@/shared/ui/EmptyState';
import { AccuracyTimeCards } from '@/widgets/AccuracyTimeCards';
import { StreakHeatmap } from '@/widgets/StreakHeatmap';
import { MasteryChart } from '@/widgets/MasteryChart';
import { DeckProgressList } from '@/widgets/DeckProgressList';
import cls from './ProgressPage.module.scss';

const ProgressPage = () => {
    const { t } = useTranslation();
    const user = useUserInfo();

    const tz = useMemo(
        () => user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        [user?.timezone],
    );

    const { data: overview } = useGetStudyOverviewQuery(tz);
    const hasData = (overview?.totalAnswers ?? 0) > 0;

    return (
        <VStack max gap="24">
            <Typography.Title level={1}>{t('Прогресс')}</Typography.Title>

            {hasData ? (
                <VStack max gap="24">
                    <AccuracyTimeCards tz={tz} />
                    <StreakHeatmap tz={tz} />
                    <div className={cls.chartsGrid}>
                        <MasteryChart />
                        <DeckProgressList tz={tz} />
                    </div>
                </VStack>
            ) : (
                <EmptyState
                    type="recent"
                    title={t('Пока нет данных для статистики')}
                    description={t('Пройдите заучивание, чтобы увидеть свой прогресс')}
                />
            )}
        </VStack>
    );
};

export default ProgressPage;
