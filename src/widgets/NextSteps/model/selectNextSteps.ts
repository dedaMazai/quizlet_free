import type { Deck } from '@/entities/Deck';
import {
    TenseMastery, getCurrentGroup, getGroupMasteryPercent,
} from '@/entities/GrammarPractice';
import type { LearningCycle } from '@/entities/LearningCycle';
import type { DeckClozeStats, DeckDue } from '@/entities/Statistics';
import { RoutePath } from '@/shared/config/router/routePath';
import { TENSES } from '@/shared/const/grammar';
import { ROADMAP_STAGES, ROADMAP_STEPS_TOTAL } from '@/shared/const/roadmap';

/** Карточек «Следующего шага» на главной (BACKLOG §7) */
export const NEXT_STEPS_LIMIT = 3;
/** Делений прогресса на карточке */
export const NEXT_STEP_TICKS = 7;
/** «Пропуски» предлагаем, если их не было столько дней */
const CLOZE_STALE_DAYS = 3;
const DAY_MS = 86_400_000;

export enum NextStepKind {
    CYCLE = 'cycle',
    CLOZE = 'cloze',
    ROADMAP = 'roadmap',
    GRAMMAR = 'grammar',
    LEARN = 'learn',
}

interface NextStepBase {
    key: string;
    path: string;
    /** Заполненных делений из NEXT_STEP_TICKS */
    filled: number;
}

export interface CycleNextStep extends NextStepBase {
    kind: NextStepKind.CYCLE;
    name: string;
    /** Новых слов в порции дня */
    portion: number;
    opened: number;
    total: number;
}

export interface ClozeNextStep extends NextStepBase {
    kind: NextStepKind.CLOZE;
    name: string;
    examples: number;
}

export interface RoadmapNextStep extends NextStepBase {
    kind: NextStepKind.ROADMAP;
    /** Ключи i18n шага */
    title: string;
    description: string;
    /** Номер шага, с 1 */
    position: number;
    total: number;
}

export interface GrammarNextStep extends NextStepBase {
    kind: NextStepKind.GRAMMAR;
    /** Самое слабое время текущей группы, не переводится */
    tense: string;
    /** Освоенность группы, 0–100 */
    percent: number;
}

export interface LearnNextStep extends NextStepBase {
    kind: NextStepKind.LEARN;
    name: string;
    newCount: number;
}

export type NextStep = CycleNextStep | ClozeNextStep | RoadmapNextStep | GrammarNextStep | LearnNextStep;

export interface NextStepsInput {
    cycles: LearningCycle[];
    decks: Deck[];
    perDeck: DeckDue[];
    clozeStats: DeckClozeStats[];
    roadmapDoneSteps: string[];
    /** Освоенность времён; пусто — практику ещё не начинали */
    tenseMastery: TenseMastery;
    /** Локальная дата пользователя, YYYY-MM-DD — как в sync_cycle_portion */
    today: string;
    now: number;
}

const toTicks = (done: number, total: number): number => (
    total > 0 ? Math.round((Math.min(done, total) / total) * NEXT_STEP_TICKS) : 0
);

/** 1. Цикл, у которого порция дня ещё не открыта и в очереди есть слова */
const selectCycle = (cycles: LearningCycle[], today: string): CycleNextStep | null => {
    const cycle = cycles.find((c) => {
        const opened = Math.min(c.current_portion * c.daily_new_count, c.words_count);
        return c.portion_date !== today && c.words_count > opened;
    });
    if (!cycle) return null;
    const opened = Math.min(cycle.current_portion * cycle.daily_new_count, cycle.words_count);
    return {
        kind: NextStepKind.CYCLE,
        key: `cycle-${cycle.uuid}`,
        path: RoutePath.CYCLE_STUDY(cycle.uuid, 'new'),
        filled: toTicks(opened, cycle.words_count),
        name: cycle.name,
        portion: Math.min(cycle.daily_new_count, cycle.words_count - opened),
        opened,
        total: cycle.words_count,
    };
};

/** 2. Колода с примерами, давно без «Пропусков»: больше всего примеров */
const selectCloze = (
    stats: DeckClozeStats[],
    deckByUuid: Map<string, Deck>,
    now: number,
): ClozeNextStep | null => {
    const best = stats
        .filter((s) => deckByUuid.has(s.deckUuid) && s.examplesCount > 0)
        .filter((s) => !s.lastClozeAt
            || now - new Date(s.lastClozeAt).getTime() >= CLOZE_STALE_DAYS * DAY_MS)
        .sort((a, b) => b.examplesCount - a.examplesCount)[0];
    const deck = best && deckByUuid.get(best.deckUuid);
    if (!best || !deck) return null;
    return {
        kind: NextStepKind.CLOZE,
        key: `cloze-${deck.uuid}`,
        path: RoutePath.CLOZE(deck.uuid),
        filled: 0,
        name: deck.name,
        examples: best.examplesCount,
    };
};

/** 3. Первый непройденный шаг дорожной карты */
const selectRoadmap = (doneSteps: string[]): RoadmapNextStep | null => {
    const steps = ROADMAP_STAGES.flatMap((stage) => stage.steps);
    const index = steps.findIndex((step) => !doneSteps.includes(step.id));
    if (index < 0) return null;
    const step = steps[index];
    return {
        kind: NextStepKind.ROADMAP,
        key: `roadmap-${step.id}`,
        path: step.path,
        filled: toTicks(doneSteps.length, ROADMAP_STEPS_TOTAL),
        title: step.title,
        description: step.description,
        position: index + 1,
        total: ROADMAP_STEPS_TOTAL,
    };
};

/** 3. Текущая группа грамматики, если практику уже начали: самое слабое её время */
const selectGrammar = (mastery: TenseMastery): GrammarNextStep | null => {
    if (Object.keys(mastery).length === 0) return null;
    const groupId = getCurrentGroup(mastery);
    if (!groupId) return null;
    const weakest = TENSES
        .filter((tense) => tense.group === groupId)
        .reduce((min, tense) => ((mastery[tense.id] ?? 0) < (mastery[min.id] ?? 0) ? tense : min));
    const percent = getGroupMasteryPercent(mastery, groupId);
    return {
        kind: NextStepKind.GRAMMAR,
        key: `grammar-${groupId}`,
        path: `${RoutePath.GRAMMAR_PRACTICE()}?group=${groupId}`,
        filled: toTicks(percent, 100),
        tense: weakest.name,
        percent,
    };
};

/** 4. Колода с наибольшим числом новых слов */
const selectLearn = (perDeck: DeckDue[], deckByUuid: Map<string, Deck>): LearnNextStep | null => {
    const best = perDeck
        .filter((d) => deckByUuid.has(d.deckUuid) && d.new > 0)
        .sort((a, b) => b.new - a.new)[0];
    const deck = best && deckByUuid.get(best.deckUuid);
    if (!best || !deck) return null;
    return {
        kind: NextStepKind.LEARN,
        key: `learn-${deck.uuid}`,
        path: RoutePath.LEARN(deck.uuid),
        filled: toTicks(deck.cards_count - best.new, deck.cards_count),
        name: deck.name,
        newCount: best.new,
    };
};

/** До трёх карточек «Следующего шага» по приоритету правил BACKLOG §7 */
export const selectNextSteps = (input: NextStepsInput): NextStep[] => {
    const deckByUuid = new Map(input.decks.map((deck) => [deck.uuid, deck]));
    return [
        selectCycle(input.cycles, input.today),
        selectCloze(input.clozeStats, deckByUuid, input.now),
        // Правило 3: группа грамматики, если практика начата, иначе шаг дорожной карты
        selectGrammar(input.tenseMastery) ?? selectRoadmap(input.roadmapDoneSteps),
        selectLearn(input.perDeck, deckByUuid),
    ]
        .filter((step): step is NextStep => step !== null)
        .slice(0, NEXT_STEPS_LIMIT);
};
