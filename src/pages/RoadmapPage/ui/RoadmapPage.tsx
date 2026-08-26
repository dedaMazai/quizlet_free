import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Card, Checkbox, Progress, Tag, Typography } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { ROADMAP_STAGES, ROADMAP_STEPS_TOTAL, RoadmapStep } from '../model/roadmap';

import cls from './RoadmapPage.module.scss';

const { Title, Text } = Typography;

const RoadmapPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [doneSteps, setDoneSteps] = useLocalStorage<string[]>('RoadmapDoneSteps', []);

    const toggleStep = (stepId: string) => {
        setDoneSteps((prev) => (
            prev.includes(stepId)
                ? prev.filter((id) => id !== stepId)
                : [...prev, stepId]
        ));
    };

    const donePercent = Math.round((doneSteps.length / ROADMAP_STEPS_TOTAL) * 100);

    const renderStep = (step: RoadmapStep) => {
        const isDone = doneSteps.includes(step.id);

        return (
            <div
                key={step.id}
                className={classNames(cls.stepRow, { [cls.stepDone]: isDone })}
                onClick={() => navigate(step.path)}
            >
                <HStack max gap="12" align="start">
                    <span onClick={(event: MouseEvent) => event.stopPropagation()}>
                        <Checkbox
                            checked={isDone}
                            onChange={() => toggleStep(step.id)}
                        />
                    </span>
                    <VStack max>
                        <Text strong delete={isDone}>{t(step.title)}</Text>
                        <Text type="secondary">{t(step.description)}</Text>
                    </VStack>
                    <RightOutlined className={cls.stepArrow} />
                </HStack>
            </div>
        );
    };

    return (
        <VStack max gap="24" className={cls.RoadmapPage}>
            <VStack max gap="8">
                <Title level={1}>{t('Дорожная карта')}</Title>
                <MyTypography.Large type="secondary">
                    {t('Путь от базы до уверенного уровня: идите по этапам сверху вниз, переходите к блокам по клику и отмечайте пройденное галочкой.')}
                </MyTypography.Large>
            </VStack>

            <Card className={cls.progressCard}>
                <VStack max gap="4">
                    <Text strong>
                        {t('Пройдено шагов: {{done}} из {{total}}', {
                            done: doneSteps.length,
                            total: ROADMAP_STEPS_TOTAL,
                        })}
                    </Text>
                    <Progress percent={donePercent} />
                </VStack>
            </Card>

            {ROADMAP_STAGES.map((stage, stageIndex) => {
                const doneInStage = stage.steps.filter((step) => doneSteps.includes(step.id)).length;

                return (
                    <Card
                        key={stage.id}
                        className={cls.stageCard}
                        title={(
                            <HStack gap="8" wrap>
                                <Text strong>
                                    {t('Этап {{number}}. {{title}}', {
                                        number: stageIndex + 1,
                                        title: t(stage.title),
                                    })}
                                </Text>
                                <Tag>{`${doneInStage}/${stage.steps.length}`}</Tag>
                            </HStack>
                        )}
                    >
                        <VStack max gap="8">
                            <Text type="secondary">{t(stage.goal)}</Text>
                            {stage.steps.map(renderStep)}
                        </VStack>
                    </Card>
                );
            })}
        </VStack>
    );
};

export default RoadmapPage;
