import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import {
    Alert, Button, Card, Input, Segmented, Tag, Tooltip, Typography,
} from 'antd';
import {
    CheckCircleFilled, CloseCircleFilled, EyeInvisibleOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useGetAiUsageQuery } from '@/entities/Card';
import {
    AiCheckResultItem,
    useCheckGrammarAnswersMutation,
    useGenerateGrammarExercisesMutation,
} from '@/entities/GrammarPractice';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { ASPECT_GROUP_ORDER, ASPECT_GROUPS, AspectGroupId } from '@/shared/const/grammar';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import {
    SessionTask, buildTemplateTasks, checkTemplateAnswers, tenseNamesForGroups,
} from '../model/templateSession';

import cls from './GrammarPracticePage.module.scss';

const { Text } = Typography;

type SourceMode = 'templates' | 'ai';
type Phase = 'setup' | 'answering' | 'checked';

const TASKS_COUNT = 5;

const isAspectGroupId = (value: string | null): value is AspectGroupId => (
    ASPECT_GROUP_ORDER.includes(value as AspectGroupId)
);

const GrammarPracticePage = () => {
    const { t } = useTranslation();
    const { message } = useAntdApp();
    const [searchParams] = useSearchParams();

    const presetGroup = searchParams.get('group');
    const [groups, setGroups] = useState<AspectGroupId[]>(
        isAspectGroupId(presetGroup) ? [presetGroup] : [...ASPECT_GROUP_ORDER],
    );
    const [mode, setMode] = useState<SourceMode>('templates');
    const [phase, setPhase] = useState<Phase>('setup');
    const [tasks, setTasks] = useState<SessionTask[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, AiCheckResultItem>>({});
    const [advice, setAdvice] = useState('');
    const [showTranslations, setShowTranslations] = useState(false);

    const { data: aiRemaining } = useGetAiUsageQuery();
    const [generateExercises, { isLoading: isGenerating }] = useGenerateGrammarExercisesMutation();
    const [checkAnswers, { isLoading: isChecking }] = useCheckGrammarAnswersMutation();

    const toggleGroup = (groupId: AspectGroupId) => {
        setGroups((prev) => (
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId]
        ));
    };

    const startSession = async () => {
        if (groups.length === 0) {
            message.warning(t('Выберите хотя бы одну группу времён'));
            return;
        }
        setAnswers({});
        setResults({});
        setAdvice('');
        setShowTranslations(false);

        if (mode === 'templates') {
            setTasks(buildTemplateTasks(groups, TASKS_COUNT));
            setPhase('answering');
            return;
        }

        try {
            const exercises = await generateExercises({
                tenses: tenseNamesForGroups(groups),
                count: TASKS_COUNT,
            }).unwrap();
            if (exercises.length === 0) {
                message.error(t('Не удалось получить задания от ИИ'));
                return;
            }
            setTasks(exercises);
            setPhase('answering');
        } catch (error) {
            const code = (error as { error?: string })?.error ?? '';
            message.error(code.includes('AI_LIMIT_EXCEEDED')
                ? t('Лимит запросов к ИИ исчерпан')
                : t('Не удалось получить задания от ИИ'));
        }
    };

    const submitAnswers = async () => {
        if (mode === 'templates') {
            const templateResults = checkTemplateAnswers(tasks, answers);
            setResults(Object.fromEntries(templateResults.map((result) => [result.id, result])));
            setPhase('checked');
            return;
        }

        try {
            const response = await checkAnswers(tasks.map((task) => ({
                id: task.id,
                text: task.text,
                verb: task.verb,
                tense: task.tense,
                answer: answers[task.id] ?? '',
            }))).unwrap();
            setResults(Object.fromEntries(response.results.map((result) => [result.id, result])));
            setAdvice(response.advice);
            setPhase('checked');
        } catch (error) {
            const code = (error as { error?: string })?.error ?? '';
            message.error(code.includes('AI_LIMIT_EXCEEDED')
                ? t('Лимит запросов к ИИ исчерпан')
                : t('Не удалось проверить ответы'));
        }
    };

    const correctCount = tasks.filter((task) => results[task.id]?.ok).length;

    const renderTask = (task: SessionTask, index: number) => {
        const [before, after] = task.text.split('___');
        const result = phase === 'checked' ? results[task.id] : undefined;

        return (
            <Card key={task.id} className={cls.taskCard}>
                <VStack max gap="8">
                    <HStack max gap="8" wrap>
                        <Text type="secondary">{index + 1}.</Text>
                        <Tag>{task.tense}</Tag>
                        <Tag className={cls.verbTag}>{task.verb}</Tag>
                    </HStack>
                    <div className={cls.sentence}>
                        <span>{before}</span>
                        <Input
                            className={cls.answerInput}
                            maxLength={80}
                            value={answers[task.id] ?? ''}
                            status={result && !result.ok ? 'error' : undefined}
                            disabled={phase === 'checked'}
                            placeholder={t('ответ')}
                            onChange={(event) => setAnswers((prev) => ({
                                ...prev,
                                [task.id]: event.target.value,
                            }))}
                        />
                        <span>{after}</span>
                        {result && (result.ok
                            ? <CheckCircleFilled className={cls.okIcon} />
                            : <CloseCircleFilled className={cls.errorIcon} />)}
                    </div>
                    {(showTranslations || phase === 'checked') && (
                        <Text type="secondary">{task.translation}</Text>
                    )}
                    {result && !result.ok && (
                        <Text>
                            {`${t('Правильный ответ')}: `}
                            <Text strong className={cls.correctAnswer}>{result.correct}</Text>
                        </Text>
                    )}
                    {result?.tip && <Text type="warning">{result.tip}</Text>}
                </VStack>
            </Card>
        );
    };

    return (
        <VStack max gap="24" className={cls.GrammarPracticePage}>
            <VStack max gap="16">
                <SectionPageHeader section={NavSectionKey.GRAMMAR} />
                <MyTypography.Large type="secondary">
                    {t('Заполните пропуски глаголом в правильной форме — и проверьте себя.')}
                </MyTypography.Large>
            </VStack>

            {phase === 'setup' && (
                <Card className={cls.setupCard}>
                    <VStack max gap="16">
                        <VStack max gap="8">
                            <Text strong>{t('Какие времена практиковать')}</Text>
                            <Text type="secondary">
                                {t('Каждая группа — это три времени: настоящее, прошедшее и будущее. Задания берутся только из выбранных групп: одна группа — прицельная тренировка, несколько — задания вперемешку. Наведите на группу, чтобы вспомнить её идею.')}
                            </Text>
                            <HStack gap="8" wrap>
                                {ASPECT_GROUP_ORDER.map((groupId) => (
                                    <Tooltip
                                        key={groupId}
                                        title={`${t(ASPECT_GROUPS[groupId].idea)} (${ASPECT_GROUPS[groupId].formulaHint})`}
                                    >
                                        <Tag.CheckableTag
                                            checked={groups.includes(groupId)}
                                            onChange={() => toggleGroup(groupId)}
                                            className={cls.groupTag}
                                        >
                                            {ASPECT_GROUPS[groupId].name}
                                        </Tag.CheckableTag>
                                    </Tooltip>
                                ))}
                            </HStack>
                            {groups.length === 0 ? (
                                <Text type="warning">
                                    {t('Выберите хотя бы одну группу, чтобы начать.')}
                                </Text>
                            ) : (
                                <Text type="secondary">
                                    {t('В тренировку войдут: {{tenses}}', {
                                        tenses: tenseNamesForGroups(groups).join(', '),
                                    })}
                                </Text>
                            )}
                        </VStack>

                        <VStack max gap="8">
                            <Text strong>{t('Источник заданий')}</Text>
                            <Segmented
                                value={mode}
                                onChange={(value) => setMode(value as SourceMode)}
                                options={[
                                    { label: t('Шаблоны'), value: 'templates' },
                                    { label: t('ИИ (GPT)'), value: 'ai' },
                                ]}
                            />
                            <Text type="secondary">
                                {mode === 'templates'
                                    ? t('Готовые задания, проверка мгновенная и без расходования лимита ИИ.')
                                    : t('ИИ сгенерирует новые предложения и разберёт ваши ответы. Расходует 2 запроса: генерация и проверка.')}
                            </Text>
                            {mode === 'ai' && (
                                <Text type="secondary">
                                    {t('Осталось запросов: {{count}}', { count: aiRemaining ?? 0 })}
                                </Text>
                            )}
                        </VStack>

                        <HStack max>
                            <Button
                                type="primary"
                                size="large"
                                loading={isGenerating}
                                disabled={groups.length === 0}
                                onClick={startSession}
                            >
                                {t('Начать')}
                            </Button>
                        </HStack>
                    </VStack>
                </Card>
            )}

            {phase !== 'setup' && (
                <VStack max gap="16">
                    {phase === 'answering' && (
                        <HStack max justify="end">
                            <Tooltip
                                title={t('Русские переводы предложений скрыты, чтобы не подсказывать. Нажмите, чтобы показать их.')}
                            >
                                <Button
                                    icon={showTranslations ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    onClick={() => setShowTranslations((prev) => !prev)}
                                >
                                    {showTranslations ? t('Скрыть переводы') : t('Показать переводы')}
                                </Button>
                            </Tooltip>
                        </HStack>
                    )}
                    {phase === 'checked' && (
                        <Alert
                            type={correctCount === tasks.length ? 'success' : 'info'}
                            message={t('Верно: {{correct}} из {{total}}', {
                                correct: correctCount,
                                total: tasks.length,
                            })}
                            showIcon
                        />
                    )}
                    {phase === 'checked' && advice && (
                        <Alert type="warning" message={t('Совет ИИ')} description={advice} showIcon />
                    )}

                    <VStack max gap="12">
                        {tasks.map((task, index) => (
                            <Fragment key={task.id}>{renderTask(task, index)}</Fragment>
                        ))}
                    </VStack>

                    {phase === 'answering' && (
                        <HStack max gap="12">
                            <Button
                                type="primary"
                                size="large"
                                loading={isChecking}
                                onClick={submitAnswers}
                            >
                                {mode === 'ai' ? t('Отправить на проверку (1 запрос)') : t('Проверить')}
                            </Button>
                            <Button size="large" onClick={() => setPhase('setup')}>
                                {t('Изменить настройки')}
                            </Button>
                        </HStack>
                    )}
                    {phase === 'checked' && (
                        <HStack max gap="12">
                            <Button
                                type="primary"
                                size="large"
                                loading={isGenerating}
                                onClick={startSession}
                            >
                                {t('Ещё раз')}
                            </Button>
                            <Button size="large" onClick={() => setPhase('setup')}>
                                {t('Изменить настройки')}
                            </Button>
                        </HStack>
                    )}
                </VStack>
            )}
        </VStack>
    );
};

export default GrammarPracticePage;
