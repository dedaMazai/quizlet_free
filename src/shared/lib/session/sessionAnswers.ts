import { ReactNode } from 'react';
import { TickState } from '@/shared/ui/TickProgress';
import { SESSION_TICKS } from '@/shared/const/session';

/** Ответ в журнале сессии — только для отображения (прогресс, итог) */
export interface SessionAnswer {
    cardUuid: string;
    /** Засчитан (в том числе «почти верно») */
    correct: boolean;
    /** Засчитан с опечаткой */
    almost?: boolean;
    /** После этого ответа карточка «усвоена»; undefined — режим без SRS */
    mastered?: boolean;
}

export interface SessionSummary {
    answers: number;
    /** Разных карточек в сессии */
    cards: number;
    /** Доля засчитанных ответов, % */
    accuracy: number;
    durationMs: number;
    /** Усвоенных карточек (каждая один раз); null — режим без SRS */
    mastered: number | null;
    /** Карточки с ошибкой или опечаткой, в порядке первой ошибки */
    hardUuids: string[];
}

const blockStart = (position: number) => Math.floor(position / SESSION_TICKS) * SESSION_TICKS;

/**
 * Деления топбара: блок из 14 вопросов, в который попадает текущий.
 * Внутри — ответы блока (верно / неверно), текущий вопрос и впереди.
 */
export const buildSessionTicks = (answers: SessionAnswer[], withCurrent: boolean): TickState[] => {
    // Без текущего (фидбэк, итог) показываем блок последнего ответа
    const position = withCurrent ? answers.length : Math.max(answers.length - 1, 0);
    const start = blockStart(position);

    return Array.from({ length: SESSION_TICKS }, (_, i) => {
        const answer = answers[start + i];
        // Опечатка засчитана (как в точности и журнале статистики) — деление «верно»
        if (answer) return answer.correct ? TickState.CORRECT : TickState.WRONG;
        if (withCurrent && start + i === answers.length) return TickState.CURRENT;
        return TickState.TODO;
    });
};

/** Деления для просмотра без ответов (карточки): пройденные, текущая, впереди */
export const buildPositionTicks = (index: number): TickState[] => {
    const start = blockStart(index);
    return Array.from({ length: SESSION_TICKS }, (_, i) => {
        if (start + i < index) return TickState.DONE;
        if (start + i === index) return TickState.CURRENT;
        return TickState.TODO;
    });
};

export const summarizeSession = (answers: SessionAnswer[], startedAt: number): SessionSummary => {
    const hard: string[] = [];
    let correct = 0;
    const mastered = new Set<string>();
    let tracksMastery = false;

    answers.forEach((answer) => {
        if (answer.correct) correct += 1;
        if ((!answer.correct || answer.almost) && !hard.includes(answer.cardUuid)) {
            hard.push(answer.cardUuid);
        }
        if (answer.mastered !== undefined) tracksMastery = true;
        if (answer.mastered) mastered.add(answer.cardUuid);
    });

    return {
        answers: answers.length,
        cards: new Set(answers.map((answer) => answer.cardUuid)).size,
        accuracy: answers.length ? Math.round((correct / answers.length) * 100) : 0,
        durationMs: Date.now() - startedAt,
        mastered: tracksMastery ? mastered.size : null,
        hardUuids: hard,
    };
};

/** Экран итога: страница передаёт его фиче, фича — сводку и перезапуск */
export type SessionResultRenderer = (summary: SessionSummary, restart: () => void) => ReactNode;

/** «откладывать, переносить» → заголовок и уточнение под ним */
export const splitTranslation = (translation: string): [string, string] => {
    const index = translation.search(/[,;]/);
    if (index < 0) return [translation, ''];
    return [translation.slice(0, index).trim(), translation.slice(index + 1).trim()];
};
