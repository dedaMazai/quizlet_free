/**
 * Моковые данные живых демо лендинга. Содержимое карточек (EN-слово, RU-перевод, пример)
 * — это контент, как и в приложении он не переводится; интерфейсные подписи идут через t().
 */

export interface DemoCard {
    term: string;
    translation: string;
    example: string;
}

/** Карточки витрины «Карточки» в hero и в режимах */
export const DEMO_CARDS: DemoCard[] = [
    { term: 'take for granted', translation: 'принимать как должное', example: 'Don’t take your friends for granted.' },
    { term: 'reliable', translation: 'надёжный', example: 'She is the most reliable person I know.' },
    { term: 'make up my mind', translation: 'решиться, определиться', example: 'I can’t make up my mind.' },
    { term: 'eventually', translation: 'в итоге, со временем', example: 'Eventually, he found a better job.' },
];

/** «Заучивание»: выбор из 4 */
export const LEARN_DEMO = {
    prompt: 'надёжный',
    options: ['relevant', 'reliable', 'reluctant', 'remarkable'],
    answerIndex: 1,
};

/** «Письмо»: перевод RU → EN с допуском одной опечатки */
export const WRITE_DEMO = {
    prompt: 'в итоге, со временем',
    answer: 'eventually',
};

/** «Пропуски»: слово скрыто в своём примере */
export const CLOZE_DEMO = {
    before: 'They decided to',
    after: 'the meeting until Friday.',
    answer: 'postpone',
    hint: 'откладывать, переносить',
};

/** «Собери фразу»: чанки в перемешанном порядке и эталон */
export const ORDER_DEMO = {
    translation: 'Никак не могу решиться.',
    chunks: ['my mind', 'I just', 'make up', 'can’t'],
    answer: ['I just', 'can’t', 'make up', 'my mind'],
};

/** «Соберите колоду»: строки редактора с автопереводом */
export const EDITOR_DEMO_ROWS = [
    { term: 'to be fed up with', translation: 'быть сытым по горло' },
    { term: 'run out of', translation: 'закончиться (о запасах)' },
    { term: 'commute', translation: 'ездить на работу' },
];

/** Прогноз нагрузки повторений на неделю (карточек в день) */
export const WEEK_LOAD = [18, 12, 9, 14, 7, 11, 6];

/** Проверка переводов ИИ: что сейчас в колоде и что предлагает ИИ */
export const AI_CHECK_DEMO = [
    {
        term: 'fair',
        current: 'ярмарка',
        suggested: 'справедливый, честный',
        example: 'That’s not fair!',
    },
    {
        term: 'actual',
        current: 'актуальный',
        suggested: 'настоящий, фактический',
        example: 'What was the actual price?',
    },
];

/** Подбор фраз ИИ: слово → частотные коллокации */
export const AI_CHUNKS_DEMO = {
    word: 'decision',
    chunks: [
        { phrase: 'make a decision', translation: 'принять решение', example: 'We need to make a decision today.' },
        { phrase: 'a tough decision', translation: 'трудное решение', example: 'It was a tough decision for all of us.' },
        { phrase: 'reach a decision', translation: 'прийти к решению', example: 'They finally reached a decision.' },
    ],
};

/** ИИ-практика времён: предложение с пропуском и ошибочный ответ */
export const AI_PRACTICE_DEMO = {
    before: 'She',
    after: 'here since 2019.',
    verb: 'live',
    wrong: 'lives',
    right: 'has lived',
};

/** «Циклы заучивания»: слова тетради по порядку */
export const CYCLE_WORDS = [
    'appointment', 'borrow', 'colleague', 'deadline', 'efficient',
    'flexible', 'grateful', 'hesitate', 'improve', 'journey',
];

/** Слов в порции цикла на день */
export const CYCLE_PORTION = 3;

/** Трудные слова в моке «итога сессии» */
export const HARD_WORDS = ['eventually', 'reluctant', 'take for granted'];

/**
 * Активность для мока heatmap: детерминированный псевдослучайный ряд,
 * чтобы картинка не прыгала между рендерами и совпадала в обеих темах.
 */
export const HEATMAP_WEEKS = 52;
const DAYS_IN_WEEK = 7;
const HEAT_LEVELS = 5;

export const buildHeatmap = (): number[] => {
    let seed = 7;
    const next = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };

    return Array.from({ length: HEATMAP_WEEKS * DAYS_IN_WEEK }, (_, i) => {
        // Ближе к концу периода занятия регулярнее — так выглядит набравшая силу серия
        const warmup = i / (HEATMAP_WEEKS * DAYS_IN_WEEK);
        const value = next() * 0.6 + warmup * 0.35;
        return Math.min(HEAT_LEVELS - 1, Math.floor(value * HEAT_LEVELS));
    });
};
