import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'antd';
import { useGetMasteryQuery } from '@/entities/Statistics';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './MasteryChart.module.scss';

interface MasteryChartProps {
  className?: string;
}

interface Segment {
  key: string;
  label: string;
  value: number;
  colorCls: string;
}

export const MasteryChart: FC<MasteryChartProps> = ({ className }) => {
  const { t } = useTranslation();
  const { data } = useGetMasteryQuery();

  const { segments, total } = useMemo(() => {
    const o = data?.overall ?? { new: 0, learning: 0, mastered: 0 };
    const list: Segment[] = [
      { key: 'mastered', label: t('Усвоено'), value: o.mastered, colorCls: cls.mastered },
      { key: 'learning', label: t('Изучаю'), value: o.learning, colorCls: cls.learning },
      { key: 'new', label: t('Новые'), value: o.new, colorCls: cls.new },
    ];
    return { segments: list, total: o.new + o.learning + o.mastered };
  }, [data, t]);

  return (
    <Card className={classNames(cls.card, [className])} variant="borderless">
      <VStack max gap="16">
        <div className={cls.cardTitle}>{t('Освоение слов')}</div>

        <div className={cls.bar}>
          {total > 0 ? (
            segments
              .filter((s) => s.value > 0)
              .map((s) => (
                <div
                  key={s.key}
                  className={classNames(cls.segment, [s.colorCls])}
                  style={{ width: `${(s.value / total) * 100}%` }}
                />
              ))
          ) : (
            <div className={cls.barEmpty} />
          )}
        </div>

        <VStack max gap="8">
          {segments.map((s) => (
            <HStack key={s.key} max justify="between" align="center">
              <HStack gap="8" align="center">
                <span className={classNames(cls.dot, [s.colorCls])} />
                <MyTypography.Base>{s.label}</MyTypography.Base>
              </HStack>
              <MyTypography.Base>{s.value}</MyTypography.Base>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
};
