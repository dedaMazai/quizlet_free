import { memo, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    ArrowRight, BookOpen, GraduationCap, Repeat, Sparkles,
} from 'lucide-react';
import { useGetDecksQuery } from '@/entities/Deck';
import { getToday, useGetCyclesQuery } from '@/entities/LearningCycle';
import { useGetClozeStatsQuery, useGetDueSummaryQuery } from '@/entities/Statistics';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import { SectionHeader, SectionHeaderSize } from '@/shared/ui/SectionHeader';
import { TickProgress, TickProgressSize, TickState } from '@/shared/ui/TickProgress';
import { estimateReviewMinutes } from '@/shared/const/const';
import { LOCAL_STORAGE_ROADMAP_DONE_STEPS_KEY } from '@/shared/const/localstorage';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import {
    NEXT_STEP_TICKS, NextStep, NextStepKind, selectNextSteps,
} from '../model/selectNextSteps';
import cls from './NextSteps.module.scss';

const ICON_SIZE = 18;
const ARROW_SIZE = 14;
const ICON_STROKE = 1.5;
const NO_DONE_STEPS: string[] = [];

interface NextStepView {
    kicker: string;
    icon: ReactNode;
    title: string;
    body: string;
    meta: string;
    cta: string;
}

interface NextStepsProps {
    /** Часовой пояс пользователя — для сводки по колодам */
    tz: string;
    className?: string;
}

/** «Следующий шаг» на главной: до трёх карточек по правилам BACKLOG §7 (Home 6.1) */
export const NextSteps = memo((props: NextStepsProps) => {
    const { tz, className } = props;
    const { t } = useTranslation();

    const { data: cycles } = useGetCyclesQuery();
    const { data: decks } = useGetDecksQuery();
    const { data: summary } = useGetDueSummaryQuery({ tz });
    const { data: clozeStats } = useGetClozeStatsQuery();
    const [roadmapDoneSteps] = useLocalStorage(LOCAL_STORAGE_ROADMAP_DONE_STEPS_KEY, NO_DONE_STEPS);

    const steps = useMemo(() => selectNextSteps({
        cycles: cycles ?? [],
        decks: decks ?? [],
        perDeck: summary?.perDeck ?? [],
        clozeStats: clozeStats ?? [],
        roadmapDoneSteps,
        today: getToday(),
        now: Date.now(),
    }), [cycles, decks, summary, clozeStats, roadmapDoneSteps]);

    const toView = (step: NextStep): NextStepView => {
        const icon = (Icon: typeof Repeat) => (
            <Icon aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        );
        switch (step.kind) {
        case NextStepKind.CYCLE:
            return {
                kicker: t('Цикл заучивания'),
                icon: icon(Repeat),
                title: t('{{name}} — новые слова', { name: step.name }),
                body: t('{{count}} новых слов по порядку, затем повтор цикла', { count: step.portion }),
                meta: t('{{opened}} из {{count}} слов', { opened: step.opened, count: step.total }),
                cta: t('Продолжить'),
            };
        case NextStepKind.CLOZE:
            return {
                kicker: t('Пропуски · ИИ-фразы'),
                icon: icon(Sparkles),
                title: step.name,
                body: t('Вставьте слово в его пример — самый сильный формат для памяти'),
                meta: `${t('{{count}} фраз', { count: step.examples })} · ${
                    t('≈ {{count}} мин', { count: estimateReviewMinutes(step.examples) })}`,
                cta: t('Начать'),
            };
        case NextStepKind.ROADMAP:
            return {
                kicker: t('Дорожная карта'),
                icon: icon(BookOpen),
                title: t(step.title),
                body: t(step.description),
                meta: t('Шаг {{position}} из {{total}}', { position: step.position, total: step.total }),
                cta: t('Тренировать'),
            };
        default:
            return {
                kicker: t('Заучивание'),
                icon: icon(GraduationCap),
                title: step.name,
                body: t('Новые слова: выбор из четырёх, затем ввод с клавиатуры'),
                meta: t('{{count}} новых слов', { count: step.newCount }),
                cta: t('Начать'),
            };
        }
    };

    if (steps.length === 0) return null;

    return (
        <section className={classNames(cls.NextSteps, [className])}>
            <SectionHeader title={t('Следующий шаг')} size={SectionHeaderSize.LG} />
            <div className={cls.grid}>
                {steps.map((step) => {
                    const view = toView(step);
                    const ticks = Array.from(
                        { length: NEXT_STEP_TICKS },
                        (_, i) => (i < step.filled ? TickState.DONE : TickState.TODO),
                    );
                    return (
                        <Link key={step.key} to={step.path} className={cls.link}>
                            <Blueprint className={cls.card}>
                                <div className={cls.cardHead}>
                                    <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>
                                        {view.kicker}
                                    </Kicker>
                                    <span className={cls.icon}>{view.icon}</span>
                                </div>
                                <div className={cls.text}>
                                    <span className={cls.title}>{view.title}</span>
                                    <span className={cls.body}>{view.body}</span>
                                </div>
                                <TickProgress
                                    className={cls.ticks}
                                    ticks={ticks}
                                    size={TickProgressSize.SM}
                                />
                                <div className={cls.footer}>
                                    <span className={cls.meta}>{view.meta}</span>
                                    <span className={cls.cta}>
                                        {view.cta}
                                        <ArrowRight aria-hidden size={ARROW_SIZE} strokeWidth={ICON_STROKE} />
                                    </span>
                                </div>
                            </Blueprint>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
});

NextSteps.displayName = 'NextSteps';
