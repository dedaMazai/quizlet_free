import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetMasteryQuery } from '@/entities/Statistics';
import { DoughnutChart, DoughnutChartDataItem } from '@/shared/ui/DoughnutChart';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { classNames } from '@/shared/lib/classNames/classNames';

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
    <VStack gap="8" className={classNames('', [className])}>
      <MyTypography.Small type="secondary">{t('Освоение слов')}</MyTypography.Small>
      <DoughnutChart
        data={items}
        centerLabel="Усвоено"
        labelPosition="none"
        height={300}
        maxWidth={360}
      />
    </VStack>
  );
};
