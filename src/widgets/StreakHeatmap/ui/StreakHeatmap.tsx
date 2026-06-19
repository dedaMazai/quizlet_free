import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Statistic, Tooltip } from 'antd';
import { useGetStudyHeatmapQuery, useGetStudyOverviewQuery } from '@/entities/Statistics';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './StreakHeatmap.module.scss';

interface StreakHeatmapProps {
  className?: string;
  tz: string;
}

// 52 недели по 7 дней + сегодняшний.
const DAYS = 364;
const DAY_MS = 86_400_000;

const levelClass = (count: number, styles: typeof cls): string => {
  if (count <= 0) return styles.level0;
  if (count < 5) return styles.level1;
  if (count < 15) return styles.level2;
  if (count < 30) return styles.level3;
  return styles.level4;
};

const formatInTz = (date: Date, tz: string): string => new Intl.DateTimeFormat('en-CA', {
  timeZone: tz,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(date);

export const StreakHeatmap: FC<StreakHeatmapProps> = ({ className, tz }) => {
  const { t } = useTranslation();
  const { data: overview } = useGetStudyOverviewQuery(tz);
  const { data: heatmap } = useGetStudyHeatmapQuery(tz);

  // Достраиваем полную сетку из разреженного списка активных дней.
  const days = useMemo(() => {
    const counts = new Map((heatmap ?? []).map((h) => [h.date, h.count]));
    const now = Date.now();
    const result: { date: string; count: number }[] = [];
    for (let i = DAYS; i >= 0; i -= 1) {
      const date = formatInTz(new Date(now - i * DAY_MS), tz);
      result.push({ date, count: counts.get(date) ?? 0 });
    }
    return result;
  }, [heatmap, tz]);

  return (
    <VStack max gap="16" className={classNames('', [className])}>
      <HStack gap="32" wrap>
        <Statistic
          title={t('Текущая серия')}
          value={overview?.currentStreak ?? 0}
          suffix={t('дней')}
        />
        <Statistic
          title={t('Самая длинная серия')}
          value={overview?.longestStreak ?? 0}
          suffix={t('дней')}
        />
      </HStack>

      <VStack gap="8">
        <MyTypography.Small type="secondary">{t('Активность')}</MyTypography.Small>
        <div className={cls.grid}>
          {days.map((d) => (
            <Tooltip key={d.date} title={`${d.date}: ${d.count}`}>
              <div className={classNames(cls.cell, [levelClass(d.count, cls)])} />
            </Tooltip>
          ))}
        </div>
      </VStack>
    </VStack>
  );
};
