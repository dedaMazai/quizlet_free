import {
  FC, ReactNode, useEffect, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  StatsPeriod,
  useGetProgressSummaryQuery,
  useGetStudyOverviewQuery,
  useTodayKey,
} from '@/entities/Statistics';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StatCell, StatCellTone } from '@/shared/ui/StatCell';
import { getStreakLevel, STREAK_LEVEL_NAMES } from '@/shared/lib/streak';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './AccuracyTimeCards.module.scss';

const PERCENT = 100;
const MS_IN_MINUTE = 60_000;
const MINUTES_IN_HOUR = 60;
const STREAK_TONES = [
  StatCellTone.STREAK_0,
  StatCellTone.STREAK_1,
  StatCellTone.STREAK_2,
  StatCellTone.STREAK_3,
  StatCellTone.STREAK_4,
];
/** С чем сравнивается дельта — ключи i18n */
const COMPARE_LABELS: Record<StatsPeriod, string> = {
  [StatsPeriod.WEEK]: 'к прошлой неделе',
  [StatsPeriod.MONTH]: 'к прошлому месяцу',
  [StatsPeriod.YEAR]: 'к прошлому году',
};

interface AccuracyTimeCardsProps {
  className?: string;
  tz: string;
  period: StatsPeriod;
  /** Статистика другого пользователя (админ, /users/:id); без него — своя */
  userId?: string;
}

interface KpiItem {
  key: string;
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: string;
  tone: StatCellTone;
}

interface Delta {
  text: string;
  tone: StatCellTone;
}

const percentOf = (part: number, total: number): number | null => (
  total > 0 ? Math.round((part / total) * PERCENT) : null
);

/** Рост — ▲ сигналом «результат», спад и ноль — нейтрально */
const formatDelta = (diff: number, compare: string): Delta => {
  if (diff > 0) return { text: `▲ ${diff}% ${compare}`, tone: StatCellTone.SUCCESS };
  if (diff < 0) return { text: `▼ ${-diff}% ${compare}`, tone: StatCellTone.NEUTRAL };
  return { text: `0% ${compare}`, tone: StatCellTone.NEUTRAL };
};

/** KPI-полоса прогресса: точность, ответы, время, серия (6.23) */
export const AccuracyTimeCards: FC<AccuracyTimeCardsProps> = ({
  className, tz, period, userId,
}) => {
  const { t, i18n } = useTranslation();
  const { isMobile } = useMatchMedia();
  // currentData — пока грузится новый период, не показываем цифры прошлого
  const { currentData: summary, isError, refetch } = useGetProgressSummaryQuery({ tz, period, userId });
  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useGetStudyOverviewQuery({ tz, userId });

  // С новым днём сдвигаются границы периодов, а пропущенный день обнуляет серию
  const today = useTodayKey(tz);
  const loadedDayRef = useRef(today);
  useEffect(() => {
    if (loadedDayRef.current === today) return;
    loadedDayRef.current = today;
    refetch();
    refetchOverview();
  }, [today, refetch, refetchOverview]);

  const numberFormat = new Intl.NumberFormat(i18n.language);
  const compare = t(COMPARE_LABELS[period]);
  const current = summary?.current;
  const previous = summary?.previous;

  const accuracy = current ? percentOf(current.correctAnswers, current.totalAnswers) : null;
  const prevAccuracy = previous ? percentOf(previous.correctAnswers, previous.totalAnswers) : null;
  const accuracyDelta = accuracy !== null && prevAccuracy !== null
    ? formatDelta(accuracy - prevAccuracy, compare)
    : undefined;

  const answers = current?.totalAnswers ?? 0;
  const prevAnswers = previous?.totalAnswers ?? 0;
  const answersDelta = prevAnswers > 0
    ? formatDelta(Math.round(((answers - prevAnswers) / prevAnswers) * PERCENT), compare)
    : undefined;

  const durationMs = current?.totalDurationMs ?? 0;
  // Округляем до ближайшего: 1 ч 59 мин → 2 ч, 59 мин 40 с → 1 ч
  const minutes = Math.round(durationMs / MS_IN_MINUTE);
  const inHours = minutes >= MINUTES_IN_HOUR;
  const sessions = current?.sessions ?? 0;
  const sessionMinutes = sessions > 0
    ? Math.max(1, Math.round(durationMs / sessions / MS_IN_MINUTE))
    : null;

  const streak = overview?.currentStreak ?? 0;
  const level = getStreakLevel(streak);
  const streakHint = level.daysToNext === null
    ? t('Максимальный уровень — держите серию')
    : t('ещё {{count}} дней до «{{level}}»', {
      count: level.daysToNext,
      level: t(STREAK_LEVEL_NAMES[level.index + 1]),
    });

  const items: KpiItem[] = [
    {
      key: 'accuracy',
      label: t('Точность'),
      value: accuracy ?? '—',
      unit: accuracy !== null ? '%' : undefined,
      delta: accuracyDelta?.text,
      tone: accuracyDelta?.tone ?? StatCellTone.NEUTRAL,
    },
    {
      key: 'answers',
      label: t('Ответов'),
      value: numberFormat.format(answers),
      delta: answersDelta?.text,
      tone: answersDelta?.tone ?? StatCellTone.NEUTRAL,
    },
    {
      key: 'time',
      label: t('Время'),
      value: numberFormat.format(inHours ? Math.round(minutes / MINUTES_IN_HOUR) : minutes),
      unit: inHours ? t('ч') : t('мин'),
      delta: sessionMinutes !== null
        ? t('{{value}} мин в среднем за сессию', { value: sessionMinutes })
        : undefined,
      tone: StatCellTone.NEUTRAL,
    },
    {
      key: 'streak',
      // Мобильная 6.55 — без уровня серии
      label: isMobile ? t('Серия') : `${t('Серия')} · ${t(STREAK_LEVEL_NAMES[level.index])}`,
      value: streak,
      unit: t('дн'),
      delta: streakHint,
      tone: STREAK_TONES[level.index],
    },
  ];

  // При ошибке не держим вечную заглушку — показываем «—» и нули
  const loading = (key: string): boolean => (
    key === 'streak' ? overviewLoading : !summary && !isError
  );

  return (
    <Blueprint className={classNames(cls.AccuracyTimeCards, [className])}>
      {items.map((item) => (
        <StatCell
          key={item.key}
          label={item.label}
          value={loading(item.key) ? <Skeleton className={cls.valueSkeleton} /> : item.value}
          unit={loading(item.key) ? undefined : item.unit}
          delta={loading(item.key) ? <Skeleton className={cls.deltaSkeleton} /> : item.delta}
          tone={item.tone}
        />
      ))}
    </Blueprint>
  );
};
