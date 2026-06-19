import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AimOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Card } from 'antd';
import { useGetStudyOverviewQuery } from '@/entities/Statistics';
import { HStack } from '@/shared/ui/Stack';
import { formatDuration } from '@/shared/lib/helpers';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './AccuracyTimeCards.module.scss';

interface AccuracyTimeCardsProps {
  className?: string;
  tz: string;
}

interface KpiItem {
  icon: ReactNode;
  value: ReactNode;
  label: string;
}

export const AccuracyTimeCards: FC<AccuracyTimeCardsProps> = ({ className, tz }) => {
  const { t } = useTranslation();
  const { data } = useGetStudyOverviewQuery(tz);

  const accuracy = data?.accuracy != null ? Math.round(data.accuracy * 100) : 0;

  const items: KpiItem[] = [
    { icon: <AimOutlined />, value: `${accuracy}%`, label: t('Точность') },
    { icon: <BarChartOutlined />, value: data?.totalAnswers ?? 0, label: t('Всего ответов') },
    {
      icon: <ClockCircleOutlined />,
      value: formatDuration(data?.totalDurationMs ?? 0, { h: t('ч'), min: t('мин') }),
      label: t('Время изучения'),
    },
    {
      icon: <FireOutlined />,
      value: `${data?.currentStreak ?? 0} ${t('дней')}`,
      label: t('Текущая серия'),
    },
    {
      icon: <TrophyOutlined />,
      value: `${data?.longestStreak ?? 0} ${t('дней')}`,
      label: t('Самая длинная серия'),
    },
  ];

  return (
    <HStack max gap="16" wrap className={classNames('', [className])}>
      {items.map((item) => (
        <Card key={item.label} className={cls.card} variant="borderless">
          <div className={cls.iconBox}>{item.icon}</div>
          <div className={cls.value}>{item.value}</div>
          <div className={cls.label}>{item.label}</div>
        </Card>
      ))}
    </HStack>
  );
};
