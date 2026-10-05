/** Задание с пропуском ___ (из банка шаблонов или от ИИ). */
export interface PracticeTask {
    id: string;
    /** Английское предложение с пропуском ___. */
    text: string;
    /** Глагол-подсказка, возможно с пометками: 'work', 'not/like', 'just/finish'. */
    verb: string;
    /** Название времени: 'Present Simple' и т.п. */
    tense: string;
    /** Русский перевод предложения. */
    translation: string;
}

export interface GenerateExercisesArgs {
    tenses: string[];
    count: number;
}

export interface CheckAnswersItem {
    id: string;
    text: string;
    verb: string;
    tense: string;
    answer: string;
}

export interface AiCheckResultItem {
    id: string;
    ok: boolean;
    correct: string;
    tip: string | null;
}

export interface AiCheckResponse {
    results: AiCheckResultItem[];
    advice: string;
}

export interface TenseMasteryRow {
    tense_id: string;
    score: number;
}
