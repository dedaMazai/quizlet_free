export enum OnboardingStep {
    GOAL = 0,
    DECK = 1,
    SESSION = 2,
}

export const ONBOARDING_STEPS_COUNT = 3;

/** Шаг и колода — в URL (`?step=session&deck=…`), чтобы перезагрузка не сбрасывала онбординг */
export const STEP_PARAM = 'step';
export const DECK_PARAM = 'deck';

const STEP_PARAM_VALUES: Record<OnboardingStep, string | null> = {
    [OnboardingStep.GOAL]: null,
    [OnboardingStep.DECK]: 'deck',
    [OnboardingStep.SESSION]: 'session',
};

export const getStepParam = (step: OnboardingStep): string | null => STEP_PARAM_VALUES[step];

/** Шаг из URL; сессия без колоды невозможна — тогда шаг выбора колоды */
export const parseStep = (stepParam: string | null, deckUuid: string | undefined): OnboardingStep => {
    if (stepParam === STEP_PARAM_VALUES[OnboardingStep.SESSION]) {
        return deckUuid ? OnboardingStep.SESSION : OnboardingStep.DECK;
    }
    if (stepParam === STEP_PARAM_VALUES[OnboardingStep.DECK]) return OnboardingStep.DECK;
    return OnboardingStep.GOAL;
};

/** Карточек в первой сессии: остальные слова колоды — в обычных режимах */
export const FIRST_SESSION_SIZE = 20;

/** «≈ 3 / 6 / 9 / 15 минут» для целей 10 / 20 / 30 / 50 (BACKLOG §5): повторение с возвратами */
const GOAL_SECONDS_PER_CARD = 18;

/** «20 слов — 2 минуты на первое знакомство»: просмотр карточки без ответа */
const FLASHCARD_SECONDS_PER_CARD = 6;

const SECONDS_IN_MINUTE = 60;

export const estimateGoalMinutes = (goal: number): number => (
    Math.ceil((goal * GOAL_SECONDS_PER_CARD) / SECONDS_IN_MINUTE)
);

export const estimateFlashcardsMinutes = (count: number): number => (
    Math.max(1, Math.ceil((count * FLASHCARD_SECONDS_PER_CARD) / SECONDS_IN_MINUTE))
);
