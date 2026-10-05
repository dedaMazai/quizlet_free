import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Result } from 'antd';
import { Plus } from 'lucide-react';
import {
  CycleDayPlan,
  CycleWordPortion,
  LearningCycle,
  getCycleDayPlan,
  getLearnedToday,
  getToday,
  useGetCyclesQuery,
  useGetCyclesWordPortionsQuery,
} from '@/entities/LearningCycle';
import { CycleForm } from '@/features/CycleForm';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './CyclesPage.module.scss';

const ICON_SIZE = 16;
const MOBILE_ICON_SIZE = 20;
const ICON_STROKE = 1.5;
/** Ячеек в полосе карточки: доли слов «в повторе / сегодня / в очереди» */
const CELLS_COUNT = 30;

type CellKind = 'review' | 'today' | 'locked';

const NO_WORDS: CycleWordPortion[] = [];

const buildCells = (plan: CycleDayPlan): CellKind[] => {
  const total = plan.review + plan.today + plan.locked;
  if (!total) return Array<CellKind>(CELLS_COUNT).fill('locked');
  const review = Math.round((plan.review / total) * CELLS_COUNT);
  // Сегодняшняя порция видна хотя бы одной ячейкой
  const today = plan.today > 0
    ? Math.min(CELLS_COUNT - review, Math.max(1, Math.round((plan.today / total) * CELLS_COUNT)))
    : 0;
  return Array.from({ length: CELLS_COUNT }, (_, i) => {
    if (i < review) return 'review';
    return i < review + today ? 'today' : 'locked';
  });
};

interface CycleCardData {
  cycle: LearningCycle;
  plan: CycleDayPlan;
  /** Сегодняшние новые, ещё не выученные. */
  todo: number;
  cells: CellKind[];
}

const CyclesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useMatchMedia();
  const [formOpen, setFormOpen] = useState(false);
  const {
    data: cycles, isLoading, isError, refetch,
  } = useGetCyclesQuery();
  const { data: portions } = useGetCyclesWordPortionsQuery();

  const cards = useMemo<CycleCardData[]>(() => {
    const today = getToday();
    return (cycles ?? []).map((cycle) => {
      const words = portions?.[cycle.uuid] ?? NO_WORDS;
      const plan = getCycleDayPlan(cycle, words, today);
      const learned = getLearnedToday(cycle.uuid, today);
      const learnedCount = words
        .filter((word) => word.portion === plan.day && learned.has(word.uuid)).length;
      return {
        cycle,
        plan,
        todo: Math.max(0, plan.today - learnedCount),
        cells: buildCells(plan),
      };
    });
  }, [cycles, portions]);

  const createButton = (
    <Button
      type="primary"
      className={cls.createButton}
      icon={<Plus aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
      onClick={() => setFormOpen(true)}
    >
      <BlueprintMarks />
      {t('Создать цикл')}
    </Button>
  );

  // Mobile 6.40: квадрат 44×44 с «+» справа от H1
  const createIconButton = (
    <Button
      className={cls.createIconButton}
      aria-label={t('Создать цикл')}
      icon={<Plus aria-hidden size={MOBILE_ICON_SIZE} strokeWidth={ICON_STROKE} />}
      onClick={() => setFormOpen(true)}
    />
  );

  return (
    <div className={cls.CyclesPage}>
      <SectionPageHeader section={NavSectionKey.LEARN} extra={isMobile ? createIconButton : createButton} />

      <p className={cls.lead}>
        {isMobile
          ? t('Слова по порядку, как в тетради: каждый день N новых, все прошлые — в повтор.')
          : t('Записывайте слова по порядку, как в тетради. Каждый день открывается N новых, а все предыдущие идут в повтор.')}
      </p>

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
          {createButton}
        </Empty>
      )}

      {cards.length > 0 && (
        <div className={cls.grid}>
          {cards.map(({
            cycle, plan, todo, cells,
          }) => (
            <Blueprint
              key={cycle.uuid}
              as="button"
              type="button"
              className={cls.card}
              onClick={() => navigate(RoutePath.CYCLE(cycle.uuid))}
            >
              <div className={cls.cardTop}>
                <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>
                  {t('День {{day}}', { day: plan.day })}
                </Kicker>
                {todo > 0 && (
                  <span className={cls.todo}>{t('{{count}} новых', { count: todo })}</span>
                )}
              </div>
              <span className={cls.name}>{cycle.name}</span>
              <div className={cls.cells}>
                {cells.map((kind, i) => (
                  // Ячейки безымянны и не переставляются — индекс как ключ
                  <i key={i} className={classNames(cls.cell, [cls[kind]])} />
                ))}
              </div>
              <div className={cls.meta}>
                <span>{t('{{count}} слов', { count: cycle.words_count })}</span>
                <span>{t('{{count}} новых в день', { count: cycle.daily_new_count })}</span>
              </div>
            </Blueprint>
          ))}
        </div>
      )}

      <CycleForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={(cycle) => navigate(RoutePath.CYCLE(cycle.uuid))}
      />
    </div>
  );
};

export default CyclesPage;
