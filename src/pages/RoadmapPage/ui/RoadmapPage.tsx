import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Card, Checkbox, Progress, Tag, Tooltip, Typography } from 'antd';
import {
    CaretRightOutlined,
    CheckOutlined,
    DownOutlined,
    LockOutlined,
    RightOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import {
    ROADMAP_STAGES, ROADMAP_STEPS_TOTAL, RoadmapStageId, RoadmapStep,
} from '@/shared/const/roadmap';
import { LOCAL_STORAGE_ROADMAP_DONE_STEPS_KEY } from '@/shared/const/localstorage';

import cls from './RoadmapPage.module.scss';

const { Text } = Typography;

type StageStatus = 'completed' | 'current' | 'locked';

const STAGE_CLASS: Record<RoadmapStageId, string> = {
    basics: cls.stageBasics,
    vocabulary: cls.stageVocabulary,
    'grammar-a2': cls.stageGrammarA2,
    'grammar-b1': cls.stageGrammarB1,
};

const STATUS_CLASS: Record<StageStatus, string> = {
    completed: cls.stageCompleted,
    current: cls.stageCurrent,
    locked: cls.stageLocked,
};

const STAGE_STROKE: Record<RoadmapStageId, string> = {
    basics: 'var(--color-success)',
    vocabulary: 'var(--color-link)',
    'grammar-a2': 'var(--color-warning)',
    'grammar-b1': 'var(--color-error)',
};

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
    const [doneSteps, setDoneSteps] = useLocalStorage<string[]>(LOCAL_STORAGE_ROADMAP_DONE_STEPS_KEY, []);
    const [expandedOverrides, setExpandedOverrides] = useState<Partial<Record<RoadmapStageId, boolean>>>({});

    const statuses = getStageStatuses(doneSteps);
    const allDone = doneSteps.length >= ROADMAP_STEPS_TOTAL;

    const isExpanded = (stageId: RoadmapStageId) => (
        expandedOverrides[stageId] ?? (statuses[stageId] === 'current')
    );

    const toggleExpanded = (stageId: RoadmapStageId) => {
        setExpandedOverrides((prev) => ({ ...prev, [stageId]: !isExpanded(stageId) }));
    };

    const toggleStep = (stepId: string) => {
        setDoneSteps((prev) => (
            prev.includes(stepId)
                ? prev.filter((id) => id !== stepId)
                : [...prev, stepId]
        ));
    };

    const renderStep = (step: RoadmapStep, isNext: boolean) => {
        const isDone = doneSteps.includes(step.id);

        return (
            <div
                key={step.id}
                className={classNames(cls.stepRow, {
                    [cls.stepDone]: isDone,
                    [cls.stepNext]: isNext,
                })}
                onClick={() => navigate(step.path)}
            >
                <HStack max gap="12" align="start">
                    <span onClick={(event: MouseEvent) => event.stopPropagation()}>
                        <Checkbox
                            checked={isDone}
                            onChange={() => toggleStep(step.id)}
                        />
                    </span>
                    <span className={cls.stepIcon}>{step.icon}</span>
                    <VStack max>
                        <HStack gap="8" wrap>
                            <Text strong delete={isDone}>{t(step.title)}</Text>
                            {isNext && <Tag className={cls.nextTag}>{t('Следующий шаг')}</Tag>}
                        </HStack>
                        <Text type="secondary">{t(step.description)}</Text>
                    </VStack>
                    <RightOutlined className={cls.stepArrow} />
                </HStack>
            </div>
        );
    };

    return (
        <VStack max gap="24" className={cls.RoadmapPage}>
            <VStack max gap="16">
                <SectionPageHeader section={NavSectionKey.LEARN} />
                <MyTypography.Large type="secondary">
                    {t('Путь от базы до уверенного уровня: идите по этапам сверху вниз, переходите к блокам по клику и отмечайте пройденное галочкой.')}
                </MyTypography.Large>
            </VStack>

            <Card className={cls.progressCard}>
                <VStack max gap="8">
                    <Text strong>
                        {t('Пройдено шагов: {{done}} из {{total}}', {
                            done: doneSteps.length,
                            total: ROADMAP_STEPS_TOTAL,
                        })}
                    </Text>
                    <HStack max gap="8" className={cls.overallSegments}>
                        {ROADMAP_STAGES.map((stage) => {
                            const doneInStage = stage.steps
                                .filter((step) => doneSteps.includes(step.id)).length;

                            return (
                                <Progress
                                    key={stage.id}
                                    className={cls.overallSegment}
                                    percent={Math.round((doneInStage / stage.steps.length) * 100)}
                                    strokeColor={STAGE_STROKE[stage.id]}
                                    showInfo={false}
                                    size="small"
                                />
                            );
                        })}
                    </HStack>
                </VStack>
            </Card>

            <VStack max className={cls.timeline}>
                {ROADMAP_STAGES.map((stage, stageIndex) => {
                    const status = statuses[stage.id];
                    const expanded = isExpanded(stage.id);
                    const doneInStage = stage.steps
                        .filter((step) => doneSteps.includes(step.id)).length;
                    const nextStep = status === 'current'
                        ? stage.steps.find((step) => !doneSteps.includes(step.id))
                        : undefined;

                    return (
                        <div
                            key={stage.id}
                            className={classNames(cls.stage, [STAGE_CLASS[stage.id], STATUS_CLASS[status]])}
                        >
                            <div
                                className={classNames(cls.stageNode, {
                                    [cls.nodePulse]: status === 'current',
                                })}
                            >
                                {status === 'completed' ? <CheckOutlined /> : null}
                                {status === 'locked' ? <LockOutlined /> : null}
                                {status === 'current' ? stageIndex + 1 : null}
                            </div>
                            <Card className={cls.stageCard}>
                                <VStack max gap="12">
                                    <HStack
                                        max
                                        gap="8"
                                        align="start"
                                        className={cls.stageHeader}
                                        onClick={() => toggleExpanded(stage.id)}
                                    >
                                        <VStack gap="4" className={cls.stageHeading}>
                                            <HStack gap="8" wrap>
                                                <Text strong>{t(stage.title)}</Text>
                                                <Tag>{stage.level}</Tag>
                                                {status === 'current' && (
                                                    <Tag className={cls.hereTag}>{t('Вы здесь')}</Tag>
                                                )}
                                                {status === 'completed' && (
                                                    <Tag className={cls.doneTag}>{t('Пройдено')}</Tag>
                                                )}
                                            </HStack>
                                            {status === 'locked' && !expanded ? (
                                                <Text type="secondary">
                                                    {t('Откроется после этапа {{number}}', { number: stageIndex })}
                                                </Text>
                                            ) : (
                                                <Text type="secondary">{t(stage.goal)}</Text>
                                            )}
                                        </VStack>
                                        {status === 'current' && nextStep && (
                                            <span onClick={(event: MouseEvent) => event.stopPropagation()}>
                                                <Tooltip title={t('Продолжить')}>
                                                    <Button
                                                        type="primary"
                                                        shape="circle"
                                                        className={cls.continueButton}
                                                        icon={<CaretRightOutlined />}
                                                        aria-label={t('Продолжить')}
                                                        onClick={() => navigate(nextStep.path)}
                                                    />
                                                </Tooltip>
                                            </span>
                                        )}
                                        {expanded ? (
                                            <Progress
                                                type="circle"
                                                size={44}
                                                className={cls.stageRing}
                                                percent={Math.round((doneInStage / stage.steps.length) * 100)}
                                                strokeColor={STAGE_STROKE[stage.id]}
                                                format={() => `${doneInStage}/${stage.steps.length}`}
                                            />
                                        ) : (
                                            <Text type="secondary" className={cls.stageCount}>
                                                {`${doneInStage}/${stage.steps.length}`}
                                            </Text>
                                        )}
                                        <DownOutlined
                                            className={classNames(cls.collapseChevron, {
                                                [cls.chevronOpen]: expanded,
                                            })}
                                        />
                                    </HStack>
                                    {expanded && (
                                        <VStack max gap="4">
                                            {stage.steps.map((step) => renderStep(step, step.id === nextStep?.id))}
                                        </VStack>
                                    )}
                                </VStack>
                            </Card>
                        </div>
                    );
                })}

                <div className={classNames(cls.stage, [cls.finishStage])}>
                    <div
                        className={classNames(cls.stageNode, cls.finishNode, {
                            [cls.finishLocked]: !allDone,
                        })}
                    >
                        <TrophyOutlined />
                    </div>
                    <VStack gap="2" className={cls.finishText}>
                        <Text strong>{t('Цель: уверенный уровень B1')}</Text>
                        <Text type="secondary">
                            {allDone
                                ? t('Пройдено')
                                : t('Осталось шагов до цели: {{count}}', {
                                    count: ROADMAP_STEPS_TOTAL - doneSteps.length,
                                })}
                        </Text>
                    </VStack>
                </div>
            </VStack>
        </VStack>
    );
};

export default RoadmapPage;
