import { ReactNode } from 'react';
import {
    AppstoreOutlined,
    BranchesOutlined,
    CheckCircleOutlined,
    EnvironmentOutlined,
    FieldTimeOutlined,
    HistoryOutlined,
    HourglassOutlined,
    KeyOutlined,
    LineChartOutlined,
    OrderedListOutlined,
    ReadOutlined,
    RetweetOutlined,
    RiseOutlined,
    RobotOutlined,
    StarOutlined,
    SwapOutlined,
    SyncOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { RoutePath } from '@/shared/config/router/routePath';
import { TopicLevel } from '@/shared/const/grammar';

export type RoadmapStageId = 'basics' | 'vocabulary' | 'grammar-a2' | 'grammar-b1';

export interface RoadmapStep {
    id: string;
    /** Название шага — ключ i18n. */
    title: string;
    /** Что делать на шаге — ключ i18n. */
    description: string;
    path: string;
    /** Иконка шага для таймлайна. */
    icon: ReactNode;
}

export interface RoadmapStage {
    id: RoadmapStageId;
    /** Название этапа — ключ i18n. */
    title: string;
    /** Цель этапа — ключ i18n. */
    goal: string;
    /** Уровень CEFR этапа. */
    level: TopicLevel;
    steps: RoadmapStep[];
}

export const ROADMAP_STAGES: RoadmapStage[] = [
    {
        id: 'basics',
        title: 'Старт: база языка',
        goal: 'Каркас, без которого не собрать предложение: порядок слов, артикли, предлоги и простые времена.',
        level: 'A1',
        steps: [
            {
                id: 'word-order',
                title: 'Порядок слов и вопросы',
                description: 'Как строятся утверждения, вопросы и отрицания.',
                path: RoutePath.GRAMMAR_TOPIC('word-order'),
                icon: <SwapOutlined />,
            },
            {
                id: 'articles',
                title: 'Артикли',
                description: 'Когда нужен a/an, когда the, а когда ничего.',
                path: RoutePath.GRAMMAR_TOPIC('articles'),
                icon: <ReadOutlined />,
            },
            {
                id: 'prepositions',
                title: 'Предлоги времени и места',
                description: 'in, on, at — по принципу «большое → день → точка».',
                path: RoutePath.GRAMMAR_TOPIC('prepositions'),
                icon: <EnvironmentOutlined />,
            },
            {
                id: 'tenses-simple',
                title: 'Времена Simple',
                description: 'Present, Past и Future Simple — три времени для фактов.',
                path: RoutePath.GRAMMAR_TENSE_GROUP('simple'),
                icon: <FieldTimeOutlined />,
            },
            {
                id: 'first-deck',
                title: 'Первая колода слов',
                description: 'Создайте колоду и добавьте первые 10–20 слов.',
                path: RoutePath.DECKS(),
                icon: <AppstoreOutlined />,
            },
        ],
    },
    {
        id: 'vocabulary',
        title: 'Слова каждый день',
        goal: 'Словарный запас растёт от ежедневных коротких повторений, а не от больших объёмов за раз.',
        level: 'A1',
        steps: [
            {
                id: 'review',
                title: 'К повторению',
                description: 'Повторяйте слова, подошедшие по интервалам, — каждый день понемногу.',
                path: RoutePath.REVIEW(),
                icon: <HistoryOutlined />,
            },
            {
                id: 'irregular-1',
                title: 'Неправильные глаголы: группа 1',
                description: 'Самые частотные глаголы — создайте колоду и выучите три формы.',
                path: RoutePath.IRREGULAR_VERBS(),
                icon: <OrderedListOutlined />,
            },
            {
                id: 'favorites',
                title: 'Избранное',
                description: 'Помечайте трудные слова звёздочкой и прогоняйте их отдельно.',
                path: RoutePath.FAVORITES(),
                icon: <StarOutlined />,
            },
            {
                id: 'progress',
                title: 'Прогресс',
                description: 'Следите за статистикой, чтобы не терять темп.',
                path: RoutePath.PROGRESS(),
                icon: <LineChartOutlined />,
            },
        ],
    },
    {
        id: 'grammar-a2',
        title: 'Расширение грамматики',
        goal: 'Времена процессов, модальные глаголы и сравнения — уровень A2.',
        level: 'A2',
        steps: [
            {
                id: 'tenses-continuous',
                title: 'Времена Continuous',
                description: 'Процесс в моменте: be + V-ing.',
                path: RoutePath.GRAMMAR_TENSE_GROUP('continuous'),
                icon: <SyncOutlined />,
            },
            {
                id: 'modals',
                title: 'Модальные глаголы',
                description: 'can, must, should, may — отношение к действию.',
                path: RoutePath.GRAMMAR_TOPIC('modals'),
                icon: <KeyOutlined />,
            },
            {
                id: 'comparisons',
                title: 'Степени сравнения',
                description: 'bigger, more interesting, the best.',
                path: RoutePath.GRAMMAR_TOPIC('comparisons'),
                icon: <RiseOutlined />,
            },
            {
                id: 'practice-templates',
                title: 'Практика времён',
                description: 'Закрепите Simple и Continuous на заданиях с пропусками.',
                path: RoutePath.GRAMMAR_PRACTICE(),
                icon: <ThunderboltOutlined />,
            },
        ],
    },
    {
        id: 'grammar-b1',
        title: 'Уверенный уровень',
        goal: 'Perfect-времена, условные предложения и пассив — уровень B1.',
        level: 'B1',
        steps: [
            {
                id: 'tenses-perfect',
                title: 'Времена Perfect',
                description: 'Результат к моменту: have + V3.',
                path: RoutePath.GRAMMAR_TENSE_GROUP('perfect'),
                icon: <CheckCircleOutlined />,
            },
            {
                id: 'tenses-perfect-continuous',
                title: 'Времена Perfect Continuous',
                description: 'Как долго длится процесс: have been + V-ing.',
                path: RoutePath.GRAMMAR_TENSE_GROUP('perfect-continuous'),
                icon: <HourglassOutlined />,
            },
            {
                id: 'conditionals',
                title: 'Условные предложения',
                description: 'Четыре типа условий — от общих истин до сожалений о прошлом.',
                path: RoutePath.GRAMMAR_TOPIC('conditionals'),
                icon: <BranchesOutlined />,
            },
            {
                id: 'passive',
                title: 'Пассивный залог',
                description: 'be + V3: когда важно действие, а не деятель.',
                path: RoutePath.GRAMMAR_TOPIC('passive'),
                icon: <RetweetOutlined />,
            },
            {
                id: 'irregular-2-3',
                title: 'Неправильные глаголы: группы 2–3',
                description: 'Добейте оставшиеся, менее частотные глаголы.',
                path: RoutePath.IRREGULAR_VERBS(),
                icon: <OrderedListOutlined />,
            },
            {
                id: 'practice-ai',
                title: 'Практика с ИИ',
                description: 'Смешайте все группы времён и получайте новые задания от ИИ.',
                path: RoutePath.GRAMMAR_PRACTICE(),
                icon: <RobotOutlined />,
            },
        ],
    },
];

export const ROADMAP_STEPS_TOTAL = ROADMAP_STAGES
    .reduce((sum, stage) => sum + stage.steps.length, 0);
