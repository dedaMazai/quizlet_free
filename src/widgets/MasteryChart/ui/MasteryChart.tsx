import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'antd';
import { useGetMasteryQuery } from '@/entities/Statistics';
import { DoughnutChart, DoughnutChartDataItem } from '@/shared/ui/DoughnutChart';
import { VStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './MasteryChart.module.scss';

interface MasteryChartProps {
  className?: string;
}

// Цвета сегментов соответствуют легенде заучивания (LearnSession.module.scss).
const COLOR_NEW = '#bfbfbf';
const COLOR_LEARNING = '#f57834';
const COLOR_MASTERED = '#69bb80';

export const MasteryChart: FC<MasteryChartProps> = ({ className }) => {
  const { t } = useTranslation();
  const { data } = useGetMasteryQuery();

  const items: DoughnutChartDataItem[] = useMemo(() => {
    const o = data?.overall ?? { new: 0, learning: 0, mastered: 0 };
    return [
      { label: 'Новые', value: o.new, color: COLOR_NEW },
      { label: 'Изучаю', value: o.learning, color: COLOR_LEARNING },
      { label: 'Усвоено', value: o.mastered, color: COLOR_MASTERED },
    ];
  }, [data]);

  return (
    <Card className={classNames(cls.card, [className])} variant="borderless">
      <VStack max gap="12">
        <div className={cls.cardTitle}>{t('Освоение слов')}</div>
        <DoughnutChart
          data={items}
          centerLabel="Усвоено"
          labelPosition="none"
          height={300}
        />
      </VStack>
    </Card>
  );
};
