import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button } from 'antd';
import { ArrowRight, Check } from 'lucide-react';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import {
    ROADMAP_STAGES, ROADMAP_STEPS_TOTAL, RoadmapStageId, RoadmapStep,
} from '@/shared/const/roadmap';
import { LOCAL_STORAGE_ROADMAP_DONE_STEPS_KEY } from '@/shared/const/localstorage';

import cls from './RoadmapPage.module.scss';

const ARROW_SIZE = 16;
const CHECK_SIZE = 12;
const CHECK_STROKE = 2.2;
const NO_STEPS: string[] = [];

type StageStatus = 'completed' | 'current' | 'locked';

const STATUS_CLASS: Record<StageStatus, string> = {
    completed: cls.completed,
    current: cls.current,
    locked: cls.locked,
};

// Mobile 6.42: свёрнутая строка этапа
const ROW_STATUS_CLASS: Record<StageStatus, string> = {
    completed: cls.rowDone,
    current: cls.rowCurrent,
    locked: cls.rowLocked,
};

const ALL_STEPS = ROADMAP_STAGES.flatMap((stage) => stage.steps);
/** Уровень последнего этапа — цель дорожной карты */
const GOAL_LEVEL = ROADMAP_STAGES[ROADMAP_STAGES.length - 1].level;

const getStageStatuses = (doneSteps: string[]): Record<RoadmapStageId, StageStatus> => {
    const statuses = {} as Record<RoadmapStageId, StageStatus>;
    let currentFound = false;

    ROADMAP_STAGES.forEach((stage) => {
        const isCompleted = stage.steps.every((step) => doneSteps.includes(step.id));

        if (isCompleted) {
            statuses[stage.id] = 'completed';
        } else if (!currentFound) {
            statuses[stage.id] = 'current';
            currentFound = true;
        } else {
            statuses[stage.id] = 'locked';
        }
    });

    return statuses;
};

const RoadmapPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isMobile } = useMatchMedia();
    const [doneSteps, setDoneSteps] = useLocalStorage<string[]>(LOCAL_STORAGE_ROADMAP_DONE_STEPS_KEY, NO_STEPS);

    const statuses = getStageStatuses(doneSteps);
    // Аккордеон на мобильном: по умолчанию раскрыт текущий этап
    const [expanded, setExpanded] = useState<RoadmapStageId[]>(() => ROADMAP_STAGES
        .filter((stage) => statuses[stage.id] === 'current')
        .map((stage) => stage.id));
    // «Вы здесь» — первый непройденный шаг по порядку
    const hereStep = ALL_STEPS.find((step) => !doneSteps.includes(step.id));
    const doneCount = ALL_STEPS.filter((step) => doneSteps.includes(step.id)).length;

    const toggleStep = (stepId: string) => {
        setDoneSteps((prev) => (
            prev.includes(stepId)
                ? prev.filter((id) => id !== stepId)
                : [...prev, stepId]
        ));
    };

    const toggleStage = (stageId: RoadmapStageId) => {
        setExpanded((prev) => (
            prev.includes(stageId)
                ? prev.filter((id) => id !== stageId)
                : [...prev, stageId]
        ));
    };

    const track = (
        <div className={cls.track}>
            {ALL_STEPS.map((step) => (
                <i
                    key={step.id}
                    className={classNames(cls.trackStep, [], {
                        [cls.trackDone]: doneSteps.includes(step.id),
                        [cls.trackHere]: step.id === hereStep?.id,
                    })}
                />
            ))}
        </div>
    );

    const renderStep = (step: RoadmapStep) => {
        const isDone = doneSteps.includes(step.id);
        const isHere = step.id === hereStep?.id;

        return (
            <div key={step.id} className={classNames(cls.step, [], { [cls.here]: isHere })}>
                <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={t('Шаг пройден')}
                    className={classNames(cls.box, [], { [cls.boxDone]: isDone })}
                    onClick={() => toggleStep(step.id)}
                >
                    {isDone && (
                        <Check aria-hidden size={CHECK_SIZE} strokeWidth={CHECK_STROKE} />
                    )}
                </button>
                <div className={cls.stepText}>
                    <Link to={step.path} className={cls.stepTitle}>{t(step.title)}</Link>
                    {isHere && (
                        <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>
                            {t('Вы здесь')}
                        </Kicker>
                    )}
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <div className={cls.RoadmapPage}>
                <SectionPageHeader section={NavSectionKey.LEARN} />

                <div className={cls.mobileSummary}>
                    <div className={cls.summaryCount}>
                        <span className={cls.done}>
                            {doneCount}
                            <span className={cls.total}>{` / ${ROADMAP_STEPS_TOTAL}`}</span>
                        </span>
                        <span className={cls.goal}>{t('шагов до {{level}}', { level: GOAL_LEVEL })}</span>
                    </div>
                    {track}
                </div>

                <div className={cls.accordion}>
                    {ROADMAP_STAGES.map((stage, stageIndex) => {
                        const status = statuses[stage.id];
                        const stageDone = stage.steps.filter((step) => doneSteps.includes(step.id)).length;
                        const progress = `${stageDone} / ${stage.steps.length}`;
                        const subtitle = {
                            completed: t('{{progress}} пройдено', { progress }),
                            current: `${progress} · ${t('вы здесь')}`,
                            locked: t('откроется после этапа {{number}}', { number: stageIndex }),
                        }[status];

                        if (expanded.includes(stage.id)) {
                            return (
                                <Blueprint
                                    key={stage.id}
                                    className={classNames(cls.stageCard, [], {
                                        [cls.stageCardCurrent]: status === 'current',
                                    })}
                                >
                                    <button
                                        type="button"
                                        aria-expanded
                                        className={cls.stageCardHeader}
                                        onClick={() => toggleStage(stage.id)}
                                    >
                                        <span className={cls.stageTop}>
                                            <Kicker size={KickerSize.SM}>
                                                {t('Этап {{number}}', { number: stageIndex + 1 })}
                                            </Kicker>
                                            <span className={cls.stageCardLevel}>{stage.level}</span>
                                        </span>
                                        <span className={cls.stageCardTitle}>{t(stage.title)}</span>
                                        <span className={cls.stageCardMeta}>{subtitle}</span>
                                    </button>
                                    {stage.steps.map(renderStep)}
                                </Blueprint>
                            );
                        }

                        return (
                            <button
                                key={stage.id}
                                type="button"
                                aria-expanded={false}
                                className={classNames(cls.stageRow, [ROW_STATUS_CLASS[status]])}
                                onClick={() => toggleStage(stage.id)}
                            >
                                <span className={cls.badge}>{stageIndex + 1}</span>
                                <span className={cls.stageRowText}>
                                    <span className={cls.stageRowTitle}>{t(stage.title)}</span>
                                    <span className={cls.stageRowMeta}>{subtitle}</span>
                                </span>
                                <Kicker size={KickerSize.SM}>{stage.level}</Kicker>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className={cls.RoadmapPage}>
            <SectionPageHeader section={NavSectionKey.LEARN} />

            <Blueprint className={cls.summary}>
                <div className={cls.summaryInfo}>
                    <div className={cls.summaryCount}>
                        <span className={cls.done}>
                            {doneCount}
                            <span className={cls.total}>{` / ${ROADMAP_STEPS_TOTAL}`}</span>
                        </span>
                        <span className={cls.goal}>{t('шагов до цели — уверенный B1')}</span>
                    </div>
                    {track}
                </div>
                {hereStep && (
                    <Button
                        type="primary"
                        className={cls.continue}
                        onClick={() => navigate(hereStep.path)}
                    >
                        <BlueprintMarks />
                        {t('Продолжить: {{step}}', { step: t(hereStep.title) })}
                        <ArrowRight aria-hidden size={ARROW_SIZE} />
                    </Button>
                )}
            </Blueprint>

            <div className={cls.stages}>
                {ROADMAP_STAGES.map((stage, stageIndex) => (
                    <div key={stage.id} className={classNames(cls.stage, [STATUS_CLASS[statuses[stage.id]]])}>
                        <div className={cls.stageHeader}>
                            <div className={cls.stageTop}>
                                <Kicker size={KickerSize.SM}>
                                    {t('Этап {{number}}', { number: stageIndex + 1 })}
                                </Kicker>
                                <span className={cls.level}>{stage.level}</span>
                            </div>
                            <span className={cls.stageTitle}>{t(stage.title)}</span>
                            <span className={cls.stageGoal}>{t(stage.goal)}</span>
                        </div>
                        {stage.steps.map(renderStep)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoadmapPage;
