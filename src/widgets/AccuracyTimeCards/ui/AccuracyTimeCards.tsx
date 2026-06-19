import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Statistic } from 'antd';
import { useGetStudyOverviewQuery } from '@/entities/Statistics';
import { HStack } from '@/shared/ui/Stack';
import { formatDuration } from '@/shared/lib/helpers';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './AccuracyTimeCards.module.scss';

interface AccuracyTimeCardsProps {
  className?: string;
  tz: string;
}

export const AccuracyTimeCards: FC<AccuracyTimeCardsProps> = ({ className, tz }) => {
  const { t } = useTranslation();
  const { data } = useGetStudyOverviewQuery(tz);

  const accuracy = data?.accuracy != null ? Math.round(data.accuracy * 100) : 0;

  return (
    <HStack max gap="16" wrap className={classNames('', [className])}>
      <Card className={cls.card} variant="borderless">
        <Statistic title={t('Точность')} value={accuracy} suffix="%" />
      </Card>
      <Card className={cls.card} variant="borderless">
        <Statistic title={t('Всего ответов')} value={data?.totalAnswers ?? 0} />
      </Card>
      <Card className={cls.card} variant="borderless">
        <Statistic
          title={t('Время изучения')}
          value={formatDuration(data?.totalDurationMs ?? 0, { h: t('ч'), min: t('мин') })}
        />
      </Card>
    </HStack>
  );
};
