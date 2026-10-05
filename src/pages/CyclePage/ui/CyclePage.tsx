import { CSSProperties, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Empty } from 'antd';
import {
  ArrowRight, Plus, Settings, Trash2,
} from 'lucide-react';
import {
  buildNewWords,
  buildReviewWords,
  getCycleDayPlan,
  getLearnedToday,
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
import { AccentPanel } from '@/shared/ui/AccentPanel';
import { BackLink } from '@/shared/ui/BackLink';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import cls from './CyclePage.module.scss';

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;
const PERCENT = 100;

const CyclePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { modal, message } = useAntdApp();
  const { cycleId } = useParams();
  const [formOpen, setFormOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const { data: cycle, isLoading } = useGetCycleQuery(cycleId!, { skip: !cycleId });
  const { data: words, isLoading: isWordsLoading } = useGetCycleWordsQuery(cycleId!, { skip: !cycleId });
  const [syncPortion, { isLoading: isOpeningDay }] = useSyncCyclePortionMutation();
  const [deleteCycle] = useDeleteCycleMutation();

  useCyclePortionSync(cycle, words);

  const newWords = useMemo(() => (cycle && words ? buildNewWords(cycle, words) : []), [cycle, words]);
  const reviewWords = useMemo(() => (cycle && words ? buildReviewWords(cycle, words) : []), [cycle, words]);
  const plan = useMemo(
    () => (cycle && words ? getCycleDayPlan(cycle, words, getToday()) : null),
    [cycle, words],
  );
  const learnedCount = useMemo(() => {
    if (!cycleId) return 0;
    const learned = getLearnedToday(cycleId, getToday());
    return newWords.filter((word) => learned.has(word.uuid)).length;
  }, [cycleId, newWords]);

  if (!cycleId) return null;
  if (isLoading || isWordsLoading) return <Loader />;
  if (!cycle || !plan) return <Empty description={t('Цикл не найден')} />;

  const total = words?.length ?? 0;
  const restCount = newWords.length - learnedCount;
  // Ширины — данные, а не оформление: передаём через CSS-переменные
  const structureVars = {
    '--review': `${total ? (plan.review / total) * PERCENT : 0}%`,
    '--today': `${total ? (plan.today / total) * PERCENT : 0}%`,
  } as CSSProperties;

  const handleNewDay = () => {
    modal.confirm({
      title: t('Открыть следующую порцию?'),
      content: t('Сегодняшние слова перейдут в повтор, и откроется следующая порция (слов: {{count}}).', {
        count: Math.min(cycle.daily_new_count, plan.locked),
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
    <div className={cls.CyclePage}>
      <div className={cls.header}>
        <BackLink
          items={[
            { label: t('Учить'), to: RoutePath.REVIEW() },
            { label: t('Циклы заучивания'), to: RoutePath.CYCLES() },
          ]}
        />
        <div className={cls.titleRow}>
          <div className={cls.titleBlock}>
            <Kicker>
              {`${t('Цикл')} · ${t('День {{day}}', { day: plan.day })} · ${
                t('{{count}} новых в день', { count: cycle.daily_new_count })}`}
            </Kicker>
            <h1 className={cls.title}>{cycle.name}</h1>
          </div>
          <div className={cls.actions}>
            <Button
              className={cls.headerButton}
              icon={<Settings aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
              onClick={() => setFormOpen(true)}
            >
              {t('Настройки')}
            </Button>
            <Button
              className={cls.headerButton}
              icon={<Plus aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
              aria-expanded={addOpen}
              onClick={() => setAddOpen((open) => !open)}
            >
              {t('Слова')}
            </Button>
            <Button
              danger
              className={cls.iconButton}
              icon={<Trash2 aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
              aria-label={t('Удалить')}
              onClick={handleDelete}
            />
          </div>
        </div>
      </div>

      <div className={cls.overview}>
        <AccentPanel className={cls.today}>
          <Kicker tone={KickerTone.ON_DARK}>{t('Сегодня')}</Kicker>
          <div className={cls.todayNumbers}>
            <div className={cls.todayStat}>
              <span className={cls.learned}>
                {learnedCount}
                <span className={cls.learnedOf}>{`/${newWords.length}`}</span>
              </span>
              <span className={cls.todayLabel}>{t('новых выучено')}</span>
            </div>
            <div className={cls.todayStat}>
              <span className={cls.inReview}>{plan.review}</span>
              <span className={cls.todayLabel}>{t('в повторе')}</span>
            </div>
          </div>
          <div className={cls.todayActions}>
            <button
              type="button"
              className={cls.studyButton}
              disabled={!newWords.length}
              onClick={() => navigate(RoutePath.CYCLE_STUDY(cycle.uuid, 'new'))}
            >
              {t('Учить новые · {{count}}', { count: restCount || newWords.length })}
              <ArrowRight aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </button>
            <button
              type="button"
              className={cls.reviewButton}
              disabled={!reviewWords.length}
              onClick={() => navigate(RoutePath.CYCLE_STUDY(cycle.uuid, 'review'))}
            >
              {t('Повторить {{count}}', { count: reviewWords.length })}
            </button>
          </div>
        </AccentPanel>

        <Blueprint className={cls.structure}>
          <span className={cls.structureTitle}>{t('Структура цикла')}</span>
          <div className={cls.structureBar} style={structureVars}>
            <div className={cls.barReview} />
            <div className={cls.barToday} />
            <div className={cls.barLocked} />
          </div>
          <div className={cls.structureStats}>
            <div className={cls.structureStat}>
              <span className={cls.structureLabel}>{t('В повторе')}</span>
              <span className={cls.structureValue}>{plan.review}</span>
            </div>
            <div className={cls.structureStat}>
              <span className={cls.structureLabel}>{t('Сегодня')}</span>
              <span className={cls.structureValue}>{plan.today}</span>
            </div>
            <div className={cls.structureStat}>
              <span className={cls.structureLabel}>{t('В очереди')}</span>
              <span className={cls.structureValue}>{plan.locked}</span>
            </div>
          </div>
          <div className={cls.nextDay}>
            <span>{t('Готовы к следующей порции?')}</span>
            <Button
              type="link"
              className={cls.nextDayButton}
              disabled={!plan.locked}
              loading={isOpeningDay}
              onClick={handleNewDay}
            >
              {t('Новый день →')}
            </Button>
          </div>
        </Blueprint>
      </div>

      <div className={cls.words}>
        <SectionHeader
          title={t('Слова')}
          extra={total > 1 && (
            <span className={cls.wordsHint}>{t('перетаскивайте, чтобы менять порядок')}</span>
          )}
        />
        {(addOpen || total === 0) && <AddCycleWords cycleUuid={cycle.uuid} words={words ?? []} />}
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
      </div>

      <CycleForm open={formOpen} onClose={() => setFormOpen(false)} cycle={cycle} words={words} />
    </div>
  );
};

export default CyclePage;
