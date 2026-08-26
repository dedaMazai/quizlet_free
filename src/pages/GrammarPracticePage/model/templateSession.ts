import { AiCheckResultItem } from '@/entities/GrammarPractice';
import {
    AspectGroupId, PRACTICE_EXERCISES, TENSES, normalizeAnswer,
} from '@/shared/const/grammar';

/** Единый вид задания в сессии: шаблонное несёт эталонные ответы, ИИ-задание — нет. */
export interface SessionTask {
    id: string;
    text: string;
    verb: string;
    tense: string;
    translation: string;
    /** Принимаемые ответы (только у шаблонных заданий). */
    expected?: string[];
    /** Пояснение при ошибке (только у шаблонных заданий). */
    tip?: string;
}

const shuffle = <T, >(items: T[]): T[] => [...items].sort(() => Math.random() - 0.5);

export const buildTemplateTasks = (groups: AspectGroupId[], count: number): SessionTask[] => {
    const tenseIds = new Set(
        TENSES.filter((tense) => groups.includes(tense.group)).map((tense) => tense.id),
    );
    const pool = PRACTICE_EXERCISES.filter((exercise) => tenseIds.has(exercise.tenseId));

    return shuffle(pool).slice(0, count).map((exercise) => ({
        id: exercise.id,
        text: exercise.text,
        verb: exercise.verb,
        tense: TENSES.find((tense) => tense.id === exercise.tenseId)?.name ?? exercise.tenseId,
        translation: exercise.translation,
        expected: exercise.answers,
        tip: exercise.tip,
    }));
};

export const checkTemplateAnswers = (
    tasks: SessionTask[],
    answers: Record<string, string>,
): AiCheckResultItem[] => tasks.map((task) => {
    const expected = task.expected ?? [];
    const given = normalizeAnswer(answers[task.id] ?? '');
    const ok = expected.some((answer) => normalizeAnswer(answer) === given);
    return {
        id: task.id,
        ok,
        correct: expected[0] ?? '',
        tip: ok ? null : task.tip ?? null,
    };
});

/** Список названий времён выбранных групп — для запроса к ИИ. */
export const tenseNamesForGroups = (groups: AspectGroupId[]): string[] => (
    TENSES.filter((tense) => groups.includes(tense.group)).map((tense) => tense.name)
);
