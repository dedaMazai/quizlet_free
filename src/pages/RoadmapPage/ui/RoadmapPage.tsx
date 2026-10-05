import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button } from 'antd';
import { ArrowRight, Check } from 'lucide-react';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import {
    ROADMAP_STAGES, ROADMAP_STEPS_TOTAL, RoadmapStageId,
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

const ALL_STEPS = ROADMAP_STAGES.flatMap((stage) => stage.steps);

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
    const [doneSteps, setDoneSteps] = useLocalStorage<string[]>(LOCAL_STORAGE_ROADMAP_DONE_STEPS_KEY, NO_STEPS);

    const statuses = getStageStatuses(doneSteps);
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
                        {stage.steps.map((step) => {
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
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoadmapPage;
