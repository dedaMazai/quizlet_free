import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';
import { useGetStudyHeatmapQuery, useTodayKey, WEEK_DAYS } from '@/entities/Statistics';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './StreakHeatmap.module.scss';

interface StreakHeatmapProps {
  className?: string;
  tz: string;
  /** Статистика другого пользователя (админ, /users/:id); без него — своя */
  userId?: string;
}

const WEEKS = 52;
/** Мобильная 6.55: последние 4 месяца */
const WEEKS_MOBILE = 18;
const DAY_MS = 86_400_000;
const MONTHS_IN_YEAR = 12;
/** Пороги ответов за день для ступеней 1…4; 0 ответов — ступень 0 */
const LEVEL_THRESHOLDS = [1, 5, 15, 30];
const LEVEL_CLASSES = [cls.level0, cls.level1, cls.level2, cls.level3, cls.level4];
/** Сокращения месяцев по getUTCMonth — ключи i18n */
const MONTH_NAMES = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

interface HeatDay {
  date: string;
  count: number;
  future: boolean;
}

const levelOf = (count: number): number => LEVEL_THRESHOLDS.filter((min) => count >= min).length;

export const StreakHeatmap: FC<StreakHeatmapProps> = ({ className, tz, userId }) => {
  const { t } = useTranslation();
  const { data: heatmap, isLoading } = useGetStudyHeatmapQuery({ tz, userId });
  const { isMobile } = useMatchMedia();
  const weeksCount = isMobile ? WEEKS_MOBILE : WEEKS;
  // Сетка сдвигается с наступлением нового дня, даже если страницу не перезагружали
  const today = useTodayKey(tz);

  // weeksCount недель с понедельника, последняя — текущая; дни после сегодня пустые.
  const { weeks, months, activeDays } = useMemo(() => {
    const counts = new Map((heatmap ?? []).map((h) => [h.date, h.count]));
    const todayMs = Date.parse(today);
    const mondayOffset = (new Date(todayMs).getUTCDay() + WEEK_DAYS - 1) % WEEK_DAYS;
    const startMs = todayMs - (mondayOffset + (weeksCount - 1) * WEEK_DAYS) * DAY_MS;

    let active = 0;
    const grid: HeatDay[][] = Array.from({ length: weeksCount }, (_, w) => (
      Array.from({ length: WEEK_DAYS }, (__, d) => {
        const date = new Date(startMs + (w * WEEK_DAYS + d) * DAY_MS).toISOString().slice(0, 10);
        const count = counts.get(date) ?? 0;
        if (count > 0) active += 1;
        return { date, count, future: date > today };
      })
    ));

    const startMonth = new Date(startMs).getUTCMonth();
    const labels = Array.from(
      { length: MONTHS_IN_YEAR },
      (_, i) => MONTH_NAMES[(startMonth + i) % MONTHS_IN_YEAR],
    );

    return { weeks: grid, months: labels, activeDays: active };
  }, [heatmap, today, weeksCount]);

  const activeDaysText = isLoading
    ? <Skeleton className={cls.activeDaysSkeleton} />
    : (
      <span className={cls.activeDays}>
        {isMobile
          ? t('последние 4 месяца')
          : t('{{count}} дней с занятиями', { count: activeDays })}
      </span>
    );

  return (
    <div className={classNames(cls.StreakHeatmap, [className])}>
      {isMobile ? (
        <div className={cls.mobileHeader}>
          <span className={cls.mobileTitle}>{t('Активность')}</span>
          {activeDaysText}
        </div>
      ) : (
        <SectionHeader title={t('Активность за год')} extra={activeDaysText} />
      )}
      <div className={cls.grid}>
        {weeks.map((week) => (
          <div key={week[0].date} className={cls.week}>
            {week.map((day) => {
              if (day.future) return <div key={day.date} className={cls.cell} />;
              // Пока данные не пришли, пустые клетки выглядели бы как «не занимались»
              if (isLoading) return <Skeleton key={day.date} className={cls.cell} />;
              return (
                <Tooltip key={day.date} title={`${day.date}: ${day.count}`}>
                  <div className={classNames(cls.cell, [LEVEL_CLASSES[levelOf(day.count)]])} />
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
      {!isMobile && (
        <div className={cls.footer}>
          <div className={cls.months}>
            {months.map((month) => <span key={month}>{t(month)}</span>)}
          </div>
          <div className={cls.legend}>
            {t('меньше')}
            {LEVEL_CLASSES.map((levelCls) => (
              <i key={levelCls} className={classNames(cls.swatch, [levelCls])} />
            ))}
            {t('больше')}
          </div>
        </div>
      )}
    </div>
  );
};
