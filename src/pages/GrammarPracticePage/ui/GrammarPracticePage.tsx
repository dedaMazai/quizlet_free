import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { Button, Input } from 'antd';
import { Sparkles } from 'lucide-react';
import { useGetAiUsageQuery } from '@/entities/Card';
import {
    AiCheckResultItem,
    useCheckGrammarAnswersMutation,
    useGenerateGrammarExercisesMutation,
    useSaveTenseAnswersMutation,
} from '@/entities/GrammarPractice';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import {
    ASPECT_GROUP_ORDER, ASPECT_GROUPS, AspectGroupId, PRACTICE_TASKS_COUNT,
} from '@/shared/const/grammar';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { TickProgress, TickState } from '@/shared/ui/TickProgress';
import {
    SessionTask, buildTemplateTasks, checkTemplateAnswers, tenseNamesForGroups,
} from '../model/templateSession';

import cls from './GrammarPracticePage.module.scss';

type SourceMode = 'templates' | 'ai';
type Phase = 'answering' | 'checked';

const SOURCE_ICON_SIZE = 14;
const ADVICE_ICON_SIZE = 18;
const ANSWER_MAX_LENGTH = 80;

/** Подписи групп в настройках: Perfect Continuous не помещается в половину колонки */
const GROUP_LABELS: Record<AspectGroupId, string> = {
    simple: 'Simple',
    continuous: 'Continuous',
    perfect: 'Perfect',
    'perfect-continuous': 'Perf. Cont.',
};

const isAspectGroupId = (value: string | null): value is AspectGroupId => (
    ASPECT_GROUP_ORDER.includes(value as AspectGroupId)
);

/** Короткая метка времени задания: «Present Perfect» → «Pres. Perfect» */
const shortTense = (tense: string): string => tense
    .replace('Perfect Continuous', 'Perf. Cont.')
    .replace('Present', 'Pres.');

const GrammarPracticePage = () => {
    const { t, i18n } = useTranslation();
    const { message } = useAntdApp();
    const [searchParams] = useSearchParams();

    const presetGroup = searchParams.get('group');
    const [groups, setGroups] = useState<AspectGroupId[]>(
        isAspectGroupId(presetGroup) ? [presetGroup] : [...ASPECT_GROUP_ORDER],
    );
    const [mode, setMode] = useState<SourceMode>('templates');
    const [phase, setPhase] = useState<Phase>('answering');
    const [tasks, setTasks] = useState<SessionTask[]>(() => buildTemplateTasks(groups, PRACTICE_TASKS_COUNT));
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, AiCheckResultItem>>({});
    const [advice, setAdvice] = useState('');
    const [showTranslations, setShowTranslations] = useState(false);
    // Повтор «Только ошибки» — тренировка без записи в освоенность
    const [isRetry, setIsRetry] = useState(false);

    const { data: aiRemaining } = useGetAiUsageQuery();
    const [generateExercises, { isLoading: isGenerating }] = useGenerateGrammarExercisesMutation();
    const [checkAnswers, { isLoading: isChecking }] = useCheckGrammarAnswersMutation();
    const [saveTenseAnswers] = useSaveTenseAnswersMutation();

    const toggleGroup = (groupId: AspectGroupId) => {
        setGroups((prev) => (
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : ASPECT_GROUP_ORDER.filter((id) => id === groupId || prev.includes(id))
        ));
    };

    const showTasks = (nextTasks: SessionTask[], retry = false) => {
        setTasks(nextTasks);
        setIsRetry(retry);
        setAnswers({});
        setResults({});
        setAdvice('');
        setShowTranslations(false);
        setPhase('answering');
    };

    const startSession = async () => {
        if (groups.length === 0) {
            message.warning(t('Выберите хотя бы одну группу времён'));
            return;
        }

        if (mode === 'templates') {
            showTasks(buildTemplateTasks(groups, PRACTICE_TASKS_COUNT));
            return;
        }

        try {
            const exercises = await generateExercises({
                tenses: tenseNamesForGroups(groups),
                count: PRACTICE_TASKS_COUNT,
            }).unwrap();
            if (exercises.length === 0) {
                message.error(t('Не удалось получить задания от ИИ'));
                return;
            }
            showTasks(exercises);
        } catch (error) {
            const code = (error as { error?: string })?.error ?? '';
            message.error(code.includes('AI_LIMIT_EXCEEDED')
                ? t('Лимит запросов к ИИ исчерпан')
                : t('Не удалось получить задания от ИИ'));
        }
    };

    const applyResults = (items: AiCheckResultItem[]) => {
        const byId = Object.fromEntries(items.map((item) => [item.id, item]));
        setResults(byId);
        setPhase('checked');
        if (isRetry) return;
        // Освоенность — фоновая запись: её сбой не мешает разбору ответов
        saveTenseAnswers(tasks.map((task) => ({ tense: task.tense, ok: Boolean(byId[task.id]?.ok) })))
            .unwrap()
            .catch(() => message.error(t('Не удалось сохранить результат')));
    };

    const submitAnswers = async () => {
        // Шаблонные задания проверяются локально, даже если источник переключили после генерации
        if (tasks.every((task) => task.expected)) {
            applyResults(checkTemplateAnswers(tasks, answers));
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
            setAdvice(response.advice);
            applyResults(response.results);
        } catch (error) {
            const code = (error as { error?: string })?.error ?? '';
            message.error(code.includes('AI_LIMIT_EXCEEDED')
                ? t('Лимит запросов к ИИ исчерпан')
                : t('Не удалось проверить ответы'));
        }
    };

    const retryMistakes = () => {
        showTasks(tasks.filter((task) => !results[task.id]?.ok), true);
    };

    const isChecked = phase === 'checked';
    const correctCount = tasks.filter((task) => results[task.id]?.ok).length;
    const hasMistakes = isChecked && correctCount < tasks.length;

    const ticks = tasks.map((task) => {
        if (isChecked) return results[task.id]?.ok ? TickState.CORRECT : TickState.WRONG;
        return answers[task.id]?.trim() ? TickState.DONE : TickState.TODO;
    });

    const tensesCount = tenseNamesForGroups(groups).length;
    const groupsList = new Intl.ListFormat(i18n.language, { type: 'conjunction' })
        .format(groups.map((groupId) => ASPECT_GROUPS[groupId].name));

    return (
        <div className={cls.GrammarPracticePage}>
            <SectionPageHeader section={NavSectionKey.GRAMMAR} />

            <div className={cls.layout}>
                <Blueprint className={cls.settings}>
                    <div className={cls.setting}>
                        <Kicker size={KickerSize.SM}>{t('Группы времён')}</Kicker>
                        <div className={cls.groups}>
                            {ASPECT_GROUP_ORDER.map((groupId) => (
                                <button
                                    key={groupId}
                                    type="button"
                                    aria-pressed={groups.includes(groupId)}
                                    title={`${t(ASPECT_GROUPS[groupId].idea)} (${ASPECT_GROUPS[groupId].formulaHint})`}
                                    className={classNames(cls.group, [], {
                                        [cls.groupActive]: groups.includes(groupId),
                                    })}
                                    onClick={() => toggleGroup(groupId)}
                                >
                                    {GROUP_LABELS[groupId]}
                                </button>
                            ))}
                        </div>
                        <span className={cls.hint}>
                            {groups.length === 0
                                ? t('Выберите хотя бы одну группу, чтобы начать.')
                                : t('В тренировку войдут {{count}} времён: {{groups}} × настоящее, прошедшее, будущее.', {
                                    count: tensesCount,
                                    groups: groupsList,
                                })}
                        </span>
                    </div>

                    <div className={cls.setting}>
                        <Kicker size={KickerSize.SM}>{t('Источник заданий')}</Kicker>
                        <div className={cls.sources}>
                            <button
                                type="button"
                                aria-pressed={mode === 'templates'}
                                className={classNames(cls.source, [], { [cls.sourceActive]: mode === 'templates' })}
                                onClick={() => setMode('templates')}
                            >
                                {t('Шаблоны')}
                            </button>
                            <button
                                type="button"
                                aria-pressed={mode === 'ai'}
                                className={classNames(cls.source, [], { [cls.sourceActive]: mode === 'ai' })}
                                onClick={() => setMode('ai')}
                            >
                                <Sparkles aria-hidden size={SOURCE_ICON_SIZE} strokeWidth={1.5} />
                                {t('ИИ')}
                            </button>
                        </div>
                        <span className={cls.hint}>
                            {mode === 'templates'
                                ? t('Готовые задания, проверка мгновенная и без расходования лимита ИИ.')
                                : t('Новые предложения и разбор ответов. 2 запроса · осталось {{count}}.', {
                                    count: aiRemaining ?? 0,
                                })}
                        </span>
                    </div>

                    <Button
                        className={cls.newSet}
                        loading={isGenerating}
                        disabled={groups.length === 0}
                        onClick={startSession}
                    >
                        {t('Новый набор')}
                    </Button>
                </Blueprint>

                <div className={cls.session}>
                    <div className={cls.summary}>
                        <span className={cls.score}>
                            {isChecked
                                ? t('Верно {{correct}} из {{total}}', { correct: correctCount, total: tasks.length })
                                : t('Заполните пропуски')}
                        </span>
                        <TickProgress ticks={ticks} className={cls.ticks} />
                        <Button type="text" className={cls.translations} onClick={() => setShowTranslations((prev) => !prev)}>
                            {showTranslations ? t('Скрыть переводы') : t('Показать переводы')}
                        </Button>
                    </div>

                    <div className={cls.tasks}>
                        {tasks.map((task, index) => {
                            const [before, after] = task.text.split('___');
                            const result = isChecked ? results[task.id] : undefined;
                            const answer = answers[task.id] ?? '';

                            return (
                                <div key={task.id} className={cls.task}>
                                    <span className={cls.number}>{String(index + 1).padStart(2, '0')}</span>
                                    <div className={cls.body}>
                                        <div className={cls.sentence}>
                                            {before}
                                            {result
                                                ? (
                                                    <span className={classNames(cls.answer, [], { [cls.answerWrong]: !result.ok })}>
                                                        {answer.trim() || '—'}
                                                    </span>
                                                )
                                                : (
                                                    <Input
                                                        variant="underlined"
                                                        className={cls.input}
                                                        maxLength={ANSWER_MAX_LENGTH}
                                                        value={answer}
                                                        placeholder={task.verb}
                                                        aria-label={t('Ответ к заданию {{number}}', { number: index + 1 })}
                                                        onChange={(event) => setAnswers((prev) => ({
                                                            ...prev,
                                                            [task.id]: event.target.value,
                                                        }))}
                                                    />
                                                )}
                                            {after}
                                        </div>
                                        {showTranslations && <span className={cls.translation}>{task.translation}</span>}
                                        {result && !result.ok && (
                                            <span className={cls.fix}>
                                                {`${t('Правильно')}: `}
                                                <b>{result.correct}</b>
                                                {result.tip && ` — ${result.tip}`}
                                            </span>
                                        )}
                                    </div>
                                    <span className={cls.tense}>{shortTense(task.tense)}</span>
                                </div>
                            );
                        })}
                    </div>

                    {isChecked && advice && (
                        <Blueprint className={cls.advice}>
                            <Sparkles aria-hidden size={ADVICE_ICON_SIZE} strokeWidth={1.5} className={cls.adviceIcon} />
                            <div className={cls.adviceBody}>
                                <span className={cls.adviceTitle}>{t('Совет ИИ')}</span>
                                <span className={cls.adviceText}>{advice}</span>
                            </div>
                        </Blueprint>
                    )}

                    <div className={cls.actions}>
                        {isChecked
                            ? (
                                <>
                                    <Button
                                        type="primary"
                                        className={cls.primaryAction}
                                        loading={isGenerating}
                                        disabled={groups.length === 0}
                                        onClick={startSession}
                                    >
                                        <BlueprintMarks />
                                        {t('Ещё раз')}
                                    </Button>
                                    <Button className={cls.secondaryAction} disabled={!hasMistakes} onClick={retryMistakes}>
                                        {t('Только ошибки')}
                                    </Button>
                                </>
                            )
                            : (
                                <Button
                                    type="primary"
                                    className={cls.primaryAction}
                                    loading={isChecking}
                                    disabled={tasks.length === 0}
                                    onClick={submitAnswers}
                                >
                                    <BlueprintMarks />
                                    {t('Проверить')}
                                </Button>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrammarPracticePage;
