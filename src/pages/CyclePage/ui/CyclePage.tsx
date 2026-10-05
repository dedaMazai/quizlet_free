import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Statistic } from 'antd';
import {
  CalendarOutlined, DeleteOutlined, ReadOutlined, SettingOutlined, SyncOutlined,
} from '@ant-design/icons';
import {
  buildNewWords,
  buildReviewWords,
  getToday,
  useCyclePortionSync,
  useDeleteCycleMutation,
  useGetCycleQuery,
  useGetCycleWordsQuery,
  useSyncCyclePortionMutation,
} from '@/entities/LearningCycle';
import { CycleWordList } from '@/widgets/CycleWordList';
import { CycleForm } from '@/features/CycleForm';
import { AddCycleWords } from '@/features/AddCycleWords';
import { clearCycleSessions } from '@/features/CycleSession';
import { BackLink } from '@/shared/ui/BackLink';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import cls from './CyclePage.module.scss';

const CyclePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { modal, message } = useAntdApp();
  const { cycleId } = useParams();
  const [formOpen, setFormOpen] = useState(false);

  const { data: cycle, isLoading } = useGetCycleQuery(cycleId!, { skip: !cycleId });
  const { data: words, isLoading: isWordsLoading } = useGetCycleWordsQuery(cycleId!, { skip: !cycleId });
  const [syncPortion, { isLoading: isOpeningDay }] = useSyncCyclePortionMutation();
  const [deleteCycle] = useDeleteCycleMutation();

  useCyclePortionSync(cycle, words);

  const newWords = useMemo(() => (cycle && words ? buildNewWords(cycle, words) : []), [cycle, words]);
  const reviewWords = useMemo(() => (cycle && words ? buildReviewWords(cycle, words) : []), [cycle, words]);
  const lockedCount = useMemo(() => (words ?? []).filter((w) => w.portion === null).length, [words]);

  if (!cycleId) return null;
  if (isLoading || isWordsLoading) return <Loader />;
  if (!cycle) return <Empty description={t('Цикл не найден')} />;

  const total = words?.length ?? 0;

  const handleNewDay = () => {
    modal.confirm({
      title: t('Открыть следующую порцию?'),
      content: t('Сегодняшние слова перейдут в повтор, и откроется следующая порция (слов: {{count}}).', {
        count: Math.min(cycle.daily_new_count, lockedCount),
      }),
      okText: t('Открыть'),
      cancelText: t('Отмена'),
      onOk: async () => {
        try {
          await syncPortion({ cycleUuid: cycle.uuid, today: getToday(), forceNew: true }).unwrap();
          message.success(t('Открыта новая порция слов'));
        } catch {
          message.error(t('Не удалось открыть новую порцию'));
        }
      },
    });
  };

  const handleDelete = () => {
    modal.confirm({
      title: t('Удалить цикл «{{name}}»?', { name: cycle.name }),
      content: t('Все слова цикла также будут удалены.'),
      okText: t('Удалить'),
      okButtonProps: { danger: true },
      cancelText: t('Отмена'),
      onOk: async () => {
        try {
          await deleteCycle(cycle.uuid).unwrap();
          clearCycleSessions(cycle.uuid);
          navigate(RoutePath.CYCLES());
        } catch {
          message.error(t('Не удалось удалить цикл'));
        }
      },
    });
  };

  return (
    <VStack max fullHeight gap="24">
      <BackLink
        items={[
          { label: t('Учить'), to: RoutePath.REVIEW() },
          { label: t('Циклы заучивания'), to: RoutePath.CYCLES() },
        ]}
      />
      <HStack max justify="between" align="center" gap="8" wrap>
        <MyTypography.Large strong>{cycle.name}</MyTypography.Large>
        <HStack gap="8">
          <Button icon={<SettingOutlined />} onClick={() => setFormOpen(true)}>
            {t('Настройки')}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete} aria-label={t('Удалить')} />
        </HStack>
      </HStack>

      <div className={cls.stats}>
        <Statistic title={t('Сегодня новых')} value={newWords.length} suffix={`/ ${cycle.daily_new_count}`} />
        <Statistic title={t('В повторе')} value={reviewWords.length} />
        <Statistic title={t('В очереди')} value={lockedCount} />
        <Statistic title={t('Всего слов')} value={total} />
      </div>

      <HStack gap="8" wrap>
        <Button
          type="primary"
          size="large"
          icon={<ReadOutlined />}
          disabled={!newWords.length}
          onClick={() => navigate(RoutePath.CYCLE_STUDY(cycle.uuid, 'new'))}
        >
          {t('Учить новые ({{count}})', { count: newWords.length })}
        </Button>
        <Button
          size="large"
          icon={<SyncOutlined />}
          disabled={!reviewWords.length}
          onClick={() => navigate(RoutePath.CYCLE_STUDY(cycle.uuid, 'review'))}
        >
          {t('Повторить ({{count}})', { count: reviewWords.length })}
        </Button>
        <Button
          size="large"
          icon={<CalendarOutlined />}
          disabled={!lockedCount}
          loading={isOpeningDay}
          onClick={handleNewDay}
        >
          {t('Новый день')}
        </Button>
      </HStack>

      <VStack max gap="12">
        <MyTypography.Large strong>{t('Слова')}</MyTypography.Large>
        <AddCycleWords cycleUuid={cycle.uuid} words={words ?? []} />
        {total > 0 ? (
          <CycleWordList cycle={cycle} words={words ?? []} />
        ) : (
          <Empty
            className={cls.empty}
            description={t('Записывайте слова по порядку — каждый день будет открываться по {{count}} новых.', {
              count: cycle.daily_new_count,
            })}
          />
        )}
      </VStack>

      <CycleForm open={formOpen} onClose={() => setFormOpen(false)} cycle={cycle} words={words} />
    </VStack>
  );
};

export default CyclePage;
