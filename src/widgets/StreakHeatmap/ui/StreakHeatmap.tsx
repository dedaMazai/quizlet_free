import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Tooltip } from 'antd';
import { useGetStudyHeatmapQuery } from '@/entities/Statistics';
import { VStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './StreakHeatmap.module.scss';

interface StreakHeatmapProps {
  className?: string;
  tz: string;
}

// 52 недели по 7 дней + сегодняшний.
const DAYS = 364;
const DAY_MS = 86_400_000;
const LEGEND_LEVELS = [0, 1, 2, 3, 4];

const levelClass = (count: number, styles: typeof cls): string => {
  if (count <= 0) return styles.level0;
  if (count < 5) return styles.level1;
  if (count < 15) return styles.level2;
  if (count < 30) return styles.level3;
  return styles.level4;
};

const legendClass = (level: number, styles: typeof cls): string => [
  styles.level0,
  styles.level1,
  styles.level2,
  styles.level3,
  styles.level4,
][level];

const formatInTz = (date: Date, tz: string): string => new Intl.DateTimeFormat('en-CA', {
  timeZone: tz,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(date);

export const StreakHeatmap: FC<StreakHeatmapProps> = ({ className, tz }) => {
  const { t } = useTranslation();
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
    <Card className={classNames(cls.card, [className])} variant="borderless">
      <VStack max gap="12">
        <div className={cls.cardTitle}>{t('Активность')}</div>
        <div className={cls.grid}>
          {days.map((d) => (
            <Tooltip key={d.date} title={`${d.date}: ${d.count}`}>
              <div className={classNames(cls.cell, [levelClass(d.count, cls)])} />
            </Tooltip>
          ))}
        </div>
        <div className={cls.legend}>
          <span>{t('меньше')}</span>
          {LEGEND_LEVELS.map((level) => (
            <div key={level} className={classNames(cls.cell, [legendClass(level, cls)])} />
          ))}
          <span>{t('больше')}</span>
        </div>
      </VStack>
    </Card>
  );
};
