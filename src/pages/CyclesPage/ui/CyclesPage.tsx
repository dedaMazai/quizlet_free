import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button, Card, Empty, Result,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useGetCyclesQuery } from '@/entities/LearningCycle';
import { CycleForm } from '@/features/CycleForm';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './CyclesPage.module.scss';

const CyclesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const {
    data: cycles, isLoading, isError, refetch,
  } = useGetCyclesQuery();

  return (
    <VStack max fullHeight gap="16">
      <HStack max justify="between" align="center">
        <MyTypography.Large strong>{t('Циклы заучивания')}</MyTypography.Large>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          {t('Создать цикл')}
        </Button>
      </HStack>

      <MyTypography.Base type="secondary">
        {t('Записывайте слова по порядку, учите по N новых в день и повторяйте все предыдущие — как в тетради.')}
      </MyTypography.Base>

      {isLoading && <Loader />}
      {isError && (
        <Result
          status="error"
          title={t('Не удалось загрузить циклы')}
          extra={<Button onClick={refetch}>{t('Повторить')}</Button>}
        />
      )}
      {!isLoading && !isError && !cycles?.length && (
        <Empty className={cls.empty} description={t('Циклов пока нет')}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
            {t('Создать цикл')}
          </Button>
        </Empty>
      )}

      <div className={cls.grid}>
        {cycles?.map((cycle) => (
          <Card
            key={cycle.uuid}
            className={cls.card}
            hoverable
            onClick={() => navigate(RoutePath.CYCLE(cycle.uuid))}
          >
            <VStack gap="8">
              <MyTypography.Large strong>{cycle.name}</MyTypography.Large>
              <MyTypography.Small type="secondary">
                {t('Слов: {{count}}', { count: cycle.words_count })}
              </MyTypography.Small>
              <MyTypography.Small type="secondary">
                {t('Новых в день: {{count}}', { count: cycle.daily_new_count })}
              </MyTypography.Small>
            </VStack>
          </Card>
        ))}
      </div>

      <CycleForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={(cycle) => navigate(RoutePath.CYCLE(cycle.uuid))}
      />
    </VStack>
  );
};

export default CyclesPage;
