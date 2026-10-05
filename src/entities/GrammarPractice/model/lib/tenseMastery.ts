import { ASPECT_GROUP_ORDER, AspectGroupId, TENSES } from '@/shared/const/grammar';
import { MASTERY_SUCCESS_THRESHOLD } from '@/shared/ui/MasteryBar';

/** Сколько последних ответов по каждому времени учитывается — столько же делений в матрице */
export const TENSE_MASTERY_TICKS = 5;

/** id времени → верных среди последних TENSE_MASTERY_TICKS ответов */
export type TenseMastery = Record<string, number>;

export interface TenseAnswer {
    /** Название времени, как в задании: 'Present Perfect' */
    tense: string;
    ok: boolean;
}

/** id времени по названию из задания (шаблон или ИИ) */
export const findTenseId = (name: string): string | undefined => (
    TENSES.find((tense) => tense.name.toLowerCase() === name.trim().toLowerCase())?.id
);

/** Освоенность группы, 0–100: доля набранных делений по её трём временам */
export const getGroupMasteryPercent = (mastery: TenseMastery, groupId: AspectGroupId): number => {
    const tenses = TENSES.filter((tense) => tense.group === groupId);
    const score = tenses.reduce((sum, tense) => sum + (mastery[tense.id] ?? 0), 0);
    return Math.round((score * 100) / (tenses.length * TENSE_MASTERY_TICKS));
};

/** Группа освоена при ≥80% делений — тот же порог «усвоено», что у колод */
export const isGroupMastered = (mastery: TenseMastery, groupId: AspectGroupId): boolean => (
    getGroupMasteryPercent(mastery, groupId) >= MASTERY_SUCCESS_THRESHOLD
);

/** Текущая группа — первая неосвоенная по порядку изучения */
export const getCurrentGroup = (mastery: TenseMastery): AspectGroupId | undefined => (
    ASPECT_GROUP_ORDER.find((groupId) => !isGroupMastered(mastery, groupId))
);
