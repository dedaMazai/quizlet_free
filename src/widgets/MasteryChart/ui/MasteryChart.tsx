import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetMasteryQuery } from '@/entities/Statistics';
import { Blueprint } from '@/shared/ui/Blueprint';
import { MASTERY_SUCCESS_THRESHOLD, MasteryBar, MasteryBarSize } from '@/shared/ui/MasteryBar';
import { Skeleton } from '@/shared/ui/Skeleton';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './MasteryChart.module.scss';

const PERCENT = 100;

interface MasteryChartProps {
  className?: string;
  /** Статистика другого пользователя (админ, /users/:id); без него — своя */
  userId?: string;
}

interface Segment {
  key: string;
  label: string;
  value: number;
  colorCls: string;
}

/** Освоение слов: полоса из 3 сегментов и легенда с числами (6.23) */
export const MasteryChart: FC<MasteryChartProps> = ({ className, userId }) => {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useGetMasteryQuery(userId);
  const { isMobile } = useMatchMedia();

  const { segments, total, masteredPct, learningPct } = useMemo(() => {
    const o = data?.overall ?? { new: 0, learning: 0, mastered: 0 };
    const sum = o.new + o.learning + o.mastered;
    const mastered = sum > 0 ? (o.mastered / sum) * PERCENT : 0;
    const list: Segment[] = [
      {
        key: 'mastered',
        label: t('Усвоено'),
        value: o.mastered,
        // Как в MasteryBar: от 80% «усвоено» окрашивается сигналом «результат»
        colorCls: mastered >= MASTERY_SUCCESS_THRESHOLD ? cls.success : cls.mastered,
      },
      { key: 'learning', label: t('Изучаю'), value: o.learning, colorCls: cls.learning },
      { key: 'new', label: t('Новые'), value: o.new, colorCls: cls.fresh },
    ];
    return {
      segments: list,
      total: sum,
      masteredPct: mastered,
      learningPct: sum > 0 ? (o.learning / sum) * PERCENT : 0,
    };
  }, [data, t]);

  const numberFormat = new Intl.NumberFormat(i18n.language);

  return (
    <Blueprint className={classNames(cls.MasteryChart, [className])}>
      <div className={cls.header}>
        <span className={cls.title}>{t('Освоение слов')}</span>
        {isLoading ? <Skeleton className={cls.totalSkeleton} /> : (
          <span className={cls.total}>
            {/* Мобильная 6.55 — только число */}
            {isMobile
              ? numberFormat.format(total)
              : t('{{value}} всего', { value: numberFormat.format(total) })}
          </span>
        )}
      </div>

      {isLoading ? <Skeleton className={cls.bar} /> : (
        <MasteryBar
          className={cls.bar}
          mastered={masteredPct}
          learning={learningPct}
          size={MasteryBarSize.XL}
        />
      )}

      <div className={cls.legend}>
        {segments.map((s) => (
          <div key={s.key} className={cls.legendItem}>
            <span className={cls.legendLabel}>
              <i className={classNames(cls.swatch, [s.colorCls])} />
              {s.label}
            </span>
            {isLoading
              ? <Skeleton className={cls.valueSkeleton} />
              : <span className={cls.legendValue}>{numberFormat.format(s.value)}</span>}
          </div>
        ))}
      </div>
    </Blueprint>
  );
};
