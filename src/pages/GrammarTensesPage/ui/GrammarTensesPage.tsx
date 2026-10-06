import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button } from 'antd';
import { ArrowRight } from 'lucide-react';
import {
    TENSE_MASTERY_TICKS, getCurrentGroup, isGroupMastered, useGetTenseMasteryQuery,
} from '@/entities/GrammarPractice';
import { useUserInfo } from '@/entities/User';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { usePageMeta } from '@/shared/lib/hooks/usePageMeta';
import { RoutePath, TENSE_TIME_PARAM } from '@/shared/config/router/routePath';
import {
    ASPECT_GROUP_ORDER, ASPECT_GROUPS, TENSES, TENSE_TIME_ORDER, AspectGroupId, TenseTime,
} from '@/shared/const/grammar';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { SectionHeader, SectionHeaderSize } from '@/shared/ui/SectionHeader';
import { TickProgress, TickProgressSize, TickState } from '@/shared/ui/TickProgress';

import cls from './GrammarTensesPage.module.scss';

const ARROW_SIZE = 16;
const MOBILE_ARROW_SIZE = 18;
const PERCENT = 100;

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

/** Мобильный переключатель аспектов: 4 колонки по ~87px */
const MOBILE_ASPECT_LABELS: Record<AspectGroupId, string> = {
    simple: 'Simple',
    continuous: 'Cont.',
    perfect: 'Perfect',
    'perfect-continuous': 'Perf. Cont.',
};

const PLAN_TICK_STATE: Record<PlanStatus, TickState> = {
    done: TickState.DONE,
    now: TickState.CURRENT,
    next: TickState.TODO,
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
    const userInfo = useUserInfo();
    // Страница открыта гостям — прогресс только у вошедших
    const { data: mastery = {} } = useGetTenseMasteryQuery(undefined, { skip: !userInfo });
    const { isMobile } = useMatchMedia();
    usePageMeta({
        title: t('Времена английского языка'),
        description: t('Все 12 времён английского в одной таблице: формулы, слова-маркеры, примеры с переводом и типичные ошибки. Группы Simple, Continuous, Perfect и Perfect Continuous.'),
    });
    // Выбранный на мобильном аспект; по умолчанию — текущая группа плана
    const [selectedAspect, setSelectedAspect] = useState<AspectGroupId | null>(null);

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

    if (isMobile) {
        const aspect = selectedAspect ?? currentGroup ?? ASPECT_GROUP_ORDER[0];
        const doneCount = plan.filter((step) => step.status === 'done').length;
        const nowIndex = plan.findIndex((step) => step.status === 'now');

        return (
            <div className={cls.GrammarTensesPage}>
                <SectionPageHeader section={NavSectionKey.GRAMMAR} />

                <div className={cls.aspectSwitch}>
                    {ASPECT_GROUP_ORDER.map((groupId) => (
                        <button
                            key={groupId}
                            type="button"
                            aria-pressed={groupId === aspect}
                            className={classNames(cls.aspectOption, [], { [cls.aspectOptionActive]: groupId === aspect })}
                            onClick={() => setSelectedAspect(groupId)}
                        >
                            {MOBILE_ASPECT_LABELS[groupId]}
                        </button>
                    ))}
                </div>

                <div className={cls.aspectHeader}>
                    <span className={cls.aspectHeading}>{ASPECT_GROUPS[aspect].name}</span>
                    <span className={cls.aspectFocus}>{t(ASPECT_GROUPS[aspect].focus)}</span>
                </div>

                <div className={cls.tenseCards}>
                    {TENSES.filter((tense) => tense.group === aspect).map((tense) => (
                        <Link
                            key={tense.id}
                            to={`${RoutePath.GRAMMAR_TENSE_GROUP(aspect)}?${TENSE_TIME_PARAM}=${tense.time}`}
                            aria-label={tense.name}
                            className={cls.tenseCard}
                        >
                            <BlueprintMarks />
                            <span className={cls.tenseTime}>{timeLabels[tense.time]}</span>
                            <span className={cls.formula}>{tense.shortFormula}</span>
                            <span className={cls.example}>{tense.shortExample}</span>
                        </Link>
                    ))}
                </div>

                <div className={cls.planMobile}>
                    <div className={cls.planMobileRow}>
                        <span>
                            {t('План: итерация {{current}} из {{total}}', {
                                current: nowIndex + 1,
                                total: plan.length,
                            })}
                        </span>
                        <span className={cls.planPercent}>{`${Math.round((doneCount / plan.length) * PERCENT)}%`}</span>
                    </div>
                    <TickProgress
                        size={TickProgressSize.SM}
                        ticks={plan.map((step) => PLAN_TICK_STATE[step.status])}
                    />
                </div>

                <Button
                    type="primary"
                    className={cls.practiceMobile}
                    onClick={() => navigate(`${RoutePath.GRAMMAR_PRACTICE()}?group=${aspect}`)}
                >
                    <BlueprintMarks />
                    {t('Практика {{group}}', { group: ASPECT_GROUPS[aspect].name })}
                    <ArrowRight aria-hidden size={MOBILE_ARROW_SIZE} strokeWidth={1.5} />
                </Button>
            </div>
        );
    }

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
