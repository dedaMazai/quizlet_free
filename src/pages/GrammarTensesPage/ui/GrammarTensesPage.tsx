import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button } from 'antd';
import { ArrowRight } from 'lucide-react';
import {
    TENSE_MASTERY_TICKS, getCurrentGroup, isGroupMastered, useGetTenseMasteryQuery,
} from '@/entities/GrammarPractice';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { classNames } from '@/shared/lib/classNames/classNames';
import { RoutePath } from '@/shared/config/router/routePath';
import {
    ASPECT_GROUP_ORDER, ASPECT_GROUPS, TENSES, TENSE_TIME_ORDER, AspectGroupId, TenseTime,
} from '@/shared/const/grammar';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { SectionHeader, SectionHeaderSize } from '@/shared/ui/SectionHeader';
import { TickProgress, TickProgressSize, TickState } from '@/shared/ui/TickProgress';

import cls from './GrammarTensesPage.module.scss';

const ARROW_SIZE = 16;

type PlanStatus = 'done' | 'now' | 'next';

const PLAN_STATUS_CLASS: Record<PlanStatus, string> = {
    done: cls.planDone,
    now: cls.planNow,
    next: cls.planNext,
};

/** Названия шагов плана: в узкой колонке Perfect Continuous сокращается */
const PLAN_TITLES: Record<AspectGroupId, string> = {
    simple: 'Simple',
    continuous: 'Continuous',
    perfect: 'Perfect',
    'perfect-continuous': 'Perfect Cont.',
};

const toTicks = (score: number): TickState[] => Array.from(
    { length: TENSE_MASTERY_TICKS },
    (_, i) => {
        if (score === TENSE_MASTERY_TICKS) return TickState.CORRECT;
        return i < score ? TickState.DONE : TickState.TODO;
    },
);

const GrammarTensesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: mastery = {} } = useGetTenseMasteryQuery();

    const timeLabels: Record<TenseTime, string> = {
        present: t('Наст.'),
        past: t('Прош.'),
        future: t('Буд.'),
    };

    const currentGroup = getCurrentGroup(mastery);

    const plan: { key: string; title: string; subtitle: string; status: PlanStatus }[] = [
        ...ASPECT_GROUP_ORDER.map((groupId) => {
            let status: PlanStatus = 'next';
            if (groupId === currentGroup) status = 'now';
            else if (isGroupMastered(mastery, groupId)) status = 'done';
            return {
                key: groupId,
                title: PLAN_TITLES[groupId],
                subtitle: t(ASPECT_GROUPS[groupId].focus),
                status,
            };
        }),
        {
            key: 'contrasts',
            title: t('Контрасты'),
            subtitle: t('Сводная по памяти'),
            status: currentGroup ? 'next' : 'now',
        },
    ];

    const decisionSteps = [
        { question: t('Регулярно, привычка или факт?'), answer: 'Simple' },
        { question: t('Идёт в конкретный момент?'), answer: 'Continuous' },
        { question: t('Важен результат, а не когда?'), answer: 'Perfect' },
        { question: t('Важно, как долго длится?'), answer: 'Perf. Cont.' },
    ];

    return (
        <div className={cls.GrammarTensesPage}>
            <SectionPageHeader section={NavSectionKey.GRAMMAR} />

            <div className={cls.intro}>
                <p className={cls.lead}>
                    {t('12 времён — это 4 идеи на 3 осях времени. Учите по одной группе за итерацию.')}
                </p>
                <Button
                    type="primary"
                    className={cls.practice}
                    onClick={() => navigate(currentGroup
                        ? `${RoutePath.GRAMMAR_PRACTICE()}?group=${currentGroup}`
                        : RoutePath.GRAMMAR_PRACTICE())}
                >
                    <BlueprintMarks />
                    {currentGroup
                        ? t('Практика {{group}}', { group: ASPECT_GROUPS[currentGroup].name })
                        : t('Практика времён')}
                    <ArrowRight aria-hidden size={ARROW_SIZE} strokeWidth={1.5} />
                </Button>
            </div>

            <div className={cls.matrix}>
                <div className={cls.corner} />
                {ASPECT_GROUP_ORDER.map((groupId) => (
                    <div
                        key={groupId}
                        className={classNames(cls.aspect, [], { [cls.current]: groupId === currentGroup })}
                    >
                        <div className={cls.aspectTop}>
                            <span className={cls.aspectName}>{ASPECT_GROUPS[groupId].name}</span>
                            {groupId === currentGroup && <span className={cls.now}>{t('Сейчас')}</span>}
                        </div>
                        <span className={cls.aspectIdea}>{t(ASPECT_GROUPS[groupId].shortIdea)}</span>
                    </div>
                ))}
                {TENSE_TIME_ORDER.map((time) => [
                    <Kicker key={time} size={KickerSize.SM} className={cls.time}>
                        {timeLabels[time]}
                    </Kicker>,
                    ...ASPECT_GROUP_ORDER.map((groupId) => {
                        const tense = TENSES.find((item) => item.group === groupId && item.time === time);
                        if (!tense) return <div key={groupId} className={cls.cell} />;

                        return (
                            <Link
                                key={groupId}
                                to={RoutePath.GRAMMAR_TENSE_GROUP(groupId)}
                                aria-label={tense.name}
                                className={classNames(cls.cell, [], { [cls.current]: groupId === currentGroup })}
                            >
                                <span className={cls.formula}>{tense.shortFormula}</span>
                                <span className={cls.example}>{tense.shortExample}</span>
                                <TickProgress
                                    size={TickProgressSize.XS}
                                    ticks={toTicks(mastery[tense.id] ?? 0)}
                                    className={cls.ticks}
                                />
                            </Link>
                        );
                    }),
                ])}
            </div>

            <div className={cls.bottom}>
                <div className={cls.plan}>
                    <SectionHeader title={t('План изучения')} size={SectionHeaderSize.SM} />
                    <div className={cls.planSteps}>
                        {plan.map((step, index) => (
                            <div key={step.key} className={classNames(cls.planStep, [PLAN_STATUS_CLASS[step.status]])}>
                                <div className={cls.planMarker}>
                                    <span className={cls.planNumber}>{index + 1}</span>
                                    <i className={cls.planLine} />
                                </div>
                                <span className={cls.planTitle}>{step.title}</span>
                                <span className={cls.planSubtitle}>{step.subtitle}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Blueprint className={cls.decide}>
                    <span className={cls.decideTitle}>{t('Как выбрать время')}</span>
                    {decisionSteps.map((step) => (
                        <div key={step.answer} className={cls.decideRow}>
                            <span className={cls.question}>{step.question}</span>
                            <span className={cls.answer}>{step.answer}</span>
                        </div>
                    ))}
                </Blueprint>
            </div>
        </div>
    );
};

export default GrammarTensesPage;
