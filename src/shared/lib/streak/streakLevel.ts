/** Пороги уровней серии в днях: Искра, Огонёк, Пламя, Жар, Пожар (README §1, Home.dc.html — массив `L`). */
export const STREAK_LEVEL_THRESHOLDS = [0, 3, 7, 14, 30] as const;

/** Названия уровней серии по индексу getStreakLevel — ключи i18n */
export const STREAK_LEVEL_NAMES = ['Искра', 'Огонёк', 'Пламя', 'Жар', 'Пожар'] as const;

export interface StreakLevelInfo {
    /** Индекс уровня 0…4 */
    index: number;
    /** Порог следующего уровня; `null` на максимальном */
    nextMin: number | null;
    /** Сколько дней осталось до следующего уровня; `null` на максимальном */
    daysToNext: number | null;
}

export const getStreakLevel = (days: number): StreakLevelInfo => {
    let index = 0;
    STREAK_LEVEL_THRESHOLDS.forEach((min, i) => {
        if (days >= min) index = i;
    });

    const nextMin = STREAK_LEVEL_THRESHOLDS[index + 1] ?? null;

    return {
        index,
        nextMin,
        daysToNext: nextMin === null ? null : nextMin - days,
    };
};
