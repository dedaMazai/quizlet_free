import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Result } from 'antd';
import dayjs from 'dayjs';
import {
  REVIEW_EVENTS_KEY,
  useGetDueCardsQuery,
  useGetDueCountQuery,
} from '@/entities/Card';
import { LearnSession } from '@/features/LearnSession';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';

const ReviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: dueCards, isLoading } = useGetDueCardsQuery(undefined);
  const { data: dueCount } = useGetDueCountQuery(undefined);

  const cards = useMemo(() => (dueCards ?? []).map((item) => item.card), [dueCards]);
  const reviews = useMemo(
    () => (dueCards ?? []).map((item) => item.review).filter((r) => r !== null),
    [dueCards],
  );

  if (isLoading) return <Loader />;

  if (!cards.length) {
    return (
      <Result
        status="success"
        title={t('На сегодня всё!')}
        subTitle={dueCount?.nextDueAt
          ? t('Ближайший повтор: {{date}}', {
            date: dayjs(dueCount.nextDueAt).format('D MMMM, HH:mm'),
          })
          : undefined}
        extra={(
          <Button type="primary" onClick={() => navigate(RoutePath.DECKS())}>
            {t('Учить новые слова')}
          </Button>
        )}
      />
    );
  }

  return (
    <VStack max fullHeight gap="24">
      <MyTypography.Large strong>{t('К повторению')}</MyTypography.Large>
      <LearnSession
        cards={cards}
        reviews={reviews}
        deckKey={REVIEW_EVENTS_KEY}
        deckName={t('К повторению')}
      />
    </VStack>
  );
};

export default ReviewPage;
