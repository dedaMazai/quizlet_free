export type AspectGroupId = 'simple' | 'continuous' | 'perfect' | 'perfect-continuous';
export type TenseTime = 'present' | 'past' | 'future';

export interface TenseExample {
    en: string;
    /** Русский перевод — ключ i18n. */
    ru: string;
}

export interface TenseMistake {
    wrong: string;
    right: string;
    /** Пояснение — ключ i18n. */
    note: string;
}

export interface TenseInfo {
    id: string;
    /** Название времени, не переводится. */
    name: string;
    group: AspectGroupId;
    time: TenseTime;
    formula: {
        affirmative: string;
        negative: string;
        question: string;
    };
    /** Краткая формула для сводной таблицы. */
    shortFormula: string;
    /** Мини-пример для сводной таблицы. */
    shortExample: string;
    /** Случаи употребления — ключи i18n. */
    usage: string[];
    /** Слова-маркеры, не переводятся. */
    markers: string[];
    examples: TenseExample[];
    mistakes: TenseMistake[];
}

export interface AspectGroupInfo {
    id: AspectGroupId;
    /** Название группы, не переводится. */
    name: string;
    /** Идея аспекта одним предложением — ключ i18n. */
    idea: string;
    /** Идея в двух словах для шапки матрицы — ключ i18n. */
    shortIdea: string;
    /** Фокус группы: подпись шага в плане и кикер страницы группы — ключ i18n. */
    focus: string;
    /** Общий каркас формулы группы, не переводится. */
    formulaHint: string;
}

export interface TenseComparison {
    id: string;
    /** Названия сравниваемых времён, не переводятся. */
    leftLabel: string;
    rightLabel: string;
    /** Вопрос-подсказка к левому времени: «Past Simple — когда?» — ключ i18n. */
    leftTitle: string;
    /** Когда выбирать левое время — ключ i18n. */
    leftNote: string;
    rightTitle: string;
    rightNote: string;
    rows: { left: TenseExample; right: TenseExample }[];
    /** На страницах каких групп показывать блок. */
    groups: AspectGroupId[];
}

export const ASPECT_GROUP_ORDER: AspectGroupId[] = ['simple', 'continuous', 'perfect', 'perfect-continuous'];

export const TENSE_TIME_ORDER: TenseTime[] = ['present', 'past', 'future'];

export const ASPECT_GROUPS: Record<AspectGroupId, AspectGroupInfo> = {
    simple: {
        id: 'simple',
        name: 'Simple',
        idea: 'Факт, привычка, регулярность. Действие названо целиком, без акцента на процесс.',
        shortIdea: 'факт, привычка',
        focus: 'Факты и привычки',
        formulaHint: 'V / V2 / will + V',
    },
    continuous: {
        id: 'continuous',
        name: 'Continuous',
        idea: 'Процесс в конкретный момент: действие «в кадре», оно длится прямо сейчас или длилось в тот момент.',
        shortIdea: 'процесс',
        focus: 'Процесс «в кадре»',
        formulaHint: 'be + V-ing',
    },
    perfect: {
        id: 'perfect',
        name: 'Perfect',
        idea: 'Результат к моменту: важно не «когда сделал», а «уже сделано».',
        shortIdea: 'результат',
        focus: 'Результат к моменту',
        formulaHint: 'have + V3',
    },
    'perfect-continuous': {
        id: 'perfect-continuous',
        name: 'Perfect Continuous',
        idea: 'Процесс длится вплоть до момента: важно «как долго».',
        shortIdea: 'длительность',
        focus: 'Как долго',
        formulaHint: 'have been + V-ing',
    },
};

export const TENSES: TenseInfo[] = [
    // Simple
    {
        id: 'present-simple',
        name: 'Present Simple',
        group: 'simple',
        time: 'present',
        formula: {
            affirmative: 'V / V-s',
            negative: "don't / doesn't + V",
            question: 'Do / Does … + V?',
        },
        shortFormula: 'V / V+s',
        shortExample: 'I work',
        usage: [
            'Привычки и регулярные действия',
            'Факты и общеизвестные истины',
            'Расписания и графики (поезда, сеансы)',
        ],
        markers: ['always', 'usually', 'often', 'sometimes', 'never', 'every day'],
        examples: [
            { en: 'I work from home on Fridays.', ru: 'Я работаю из дома по пятницам.' },
            { en: 'The sun rises in the east.', ru: 'Солнце встаёт на востоке.' },
        ],
        mistakes: [
            {
                wrong: 'He work in a bank.',
                right: 'He works in a bank.',
                note: 'В третьем лице единственного числа к глаголу добавляется -s.',
            },
        ],
    },
    {
        id: 'past-simple',
        name: 'Past Simple',
        group: 'simple',
        time: 'past',
        formula: {
            affirmative: 'V2 / V-ed',
            negative: "didn't + V",
            question: 'Did … + V?',
        },
        shortFormula: 'V2',
        shortExample: 'I worked',
        usage: [
            'Завершённое действие в известный момент прошлого',
            'Цепочка последовательных событий в рассказе',
        ],
        markers: ['yesterday', 'last week', 'in 2010', 'two days ago'],
        examples: [
            { en: 'We watched a movie yesterday.', ru: 'Вчера мы посмотрели фильм.' },
            { en: 'She left, locked the door and went to work.', ru: 'Она вышла, заперла дверь и пошла на работу.' },
        ],
        mistakes: [
            {
                wrong: 'Did you went there?',
                right: 'Did you go there?',
                note: 'После did глагол стоит в базовой форме.',
            },
        ],
    },
    {
        id: 'future-simple',
        name: 'Future Simple',
        group: 'simple',
        time: 'future',
        formula: {
            affirmative: 'will + V',
            negative: "won't + V",
            question: 'Will … + V?',
        },
        shortFormula: 'will + V',
        shortExample: 'I will work',
        usage: [
            'Спонтанное решение в момент речи',
            'Предсказания, обещания, предположения',
            'Факты о будущем',
        ],
        markers: ['tomorrow', 'next week', 'soon', 'I think', 'probably'],
        examples: [
            { en: "I'll help you with the bags.", ru: 'Я помогу тебе с сумками.' },
            { en: 'It will rain tomorrow.', ru: 'Завтра будет дождь.' },
        ],
        mistakes: [
            {
                wrong: 'I will to call you.',
                right: 'I will call you.',
                note: 'После will идёт инфинитив без to.',
            },
        ],
    },
    // Continuous
    {
        id: 'present-continuous',
        name: 'Present Continuous',
        group: 'continuous',
        time: 'present',
        formula: {
            affirmative: 'am / is / are + V-ing',
            negative: "am / is / are not + V-ing",
            question: 'Am / Is / Are … + V-ing?',
        },
        shortFormula: 'am/is/are + V-ing',
        shortExample: 'I am working',
        usage: [
            'Действие происходит прямо сейчас',
            'Временная ситуация (в эти дни, на этой неделе)',
            'Запланированное будущее с конкретной датой',
        ],
        markers: ['now', 'right now', 'at the moment', 'currently', 'today'],
        examples: [
            { en: 'She is talking on the phone now.', ru: 'Она сейчас говорит по телефону.' },
            { en: 'We are flying to Rome on Friday.', ru: 'Мы летим в Рим в пятницу.' },
        ],
        mistakes: [
            {
                wrong: 'I am knowing him.',
                right: 'I know him.',
                note: 'Глаголы состояния (know, like, want, need) не употребляются в Continuous.',
            },
        ],
    },
    {
        id: 'past-continuous',
        name: 'Past Continuous',
        group: 'continuous',
        time: 'past',
        formula: {
            affirmative: 'was / were + V-ing',
            negative: "wasn't / weren't + V-ing",
            question: 'Was / Were … + V-ing?',
        },
        shortFormula: 'was/were + V-ing',
        shortExample: 'I was working',
        usage: [
            'Процесс в конкретный момент прошлого',
            'Фон, на котором произошло короткое событие (оно — в Past Simple)',
        ],
        markers: ['at 5 pm yesterday', 'while', 'when', 'all evening'],
        examples: [
            { en: 'At 8 pm I was cooking dinner.', ru: 'В восемь вечера я готовил ужин.' },
            { en: 'I was reading when he called.', ru: 'Я читал, когда он позвонил.' },
        ],
        mistakes: [
            {
                wrong: 'When he called, I read.',
                right: 'When he called, I was reading.',
                note: 'Фоновый процесс — Past Continuous, короткое событие — Past Simple.',
            },
        ],
    },
    {
        id: 'future-continuous',
        name: 'Future Continuous',
        group: 'continuous',
        time: 'future',
        formula: {
            affirmative: 'will be + V-ing',
            negative: "won't be + V-ing",
            question: 'Will … be + V-ing?',
        },
        shortFormula: 'will be + V-ing',
        shortExample: 'I will be working',
        usage: [
            'Процесс в конкретный момент будущего',
            'Вежливый вопрос о планах',
        ],
        markers: ['at this time tomorrow', 'all day tomorrow'],
        examples: [
            { en: 'At noon I will be driving to Moscow.', ru: 'В полдень я буду ехать в Москву.' },
            { en: 'Will you be using the car tonight?', ru: 'Ты будешь пользоваться машиной сегодня вечером?' },
        ],
        mistakes: [
            {
                wrong: 'I will working tomorrow.',
                right: 'I will be working tomorrow.',
                note: 'Не теряйте be перед V-ing.',
            },
        ],
    },
    // Perfect
    {
        id: 'present-perfect',
        name: 'Present Perfect',
        group: 'perfect',
        time: 'present',
        formula: {
            affirmative: 'have / has + V3',
            negative: "haven't / hasn't + V3",
            question: 'Have / Has … + V3?',
        },
        shortFormula: 'have/has + V3',
        shortExample: 'I have worked',
        usage: [
            'Результат к настоящему моменту, время не названо',
            'Опыт за жизнь (ever, never)',
            'Действие началось в прошлом и длится до сих пор (for, since)',
        ],
        markers: ['already', 'just', 'yet', 'ever', 'never', 'since', 'for'],
        examples: [
            { en: 'I have lost my keys.', ru: 'Я потерял ключи (и сейчас их нет).' },
            { en: 'Have you ever been to London?', ru: 'Ты когда-нибудь был в Лондоне?' },
        ],
        mistakes: [
            {
                wrong: 'I have seen him yesterday.',
                right: 'I saw him yesterday.',
                note: 'С указанием момента времени (yesterday, in 2010) употребляется Past Simple.',
            },
        ],
    },
    {
        id: 'past-perfect',
        name: 'Past Perfect',
        group: 'perfect',
        time: 'past',
        formula: {
            affirmative: 'had + V3',
            negative: "hadn't + V3",
            question: 'Had … + V3?',
        },
        shortFormula: 'had + V3',
        shortExample: 'I had worked',
        usage: [
            '«Прошлое до прошлого»: действие завершилось раньше другого прошлого события',
        ],
        markers: ['by the time', 'before', 'after', 'already', 'never before'],
        examples: [
            { en: 'The train had left before we arrived.', ru: 'Поезд ушёл до того, как мы приехали.' },
        ],
        mistakes: [
            {
                wrong: 'After he left, I had called her.',
                right: 'After he had left, I called her.',
                note: 'Had ставится у более раннего из двух действий.',
            },
        ],
    },
    {
        id: 'future-perfect',
        name: 'Future Perfect',
        group: 'perfect',
        time: 'future',
        formula: {
            affirmative: 'will have + V3',
            negative: "won't have + V3",
            question: 'Will … have + V3?',
        },
        shortFormula: 'will have + V3',
        shortExample: 'I will have worked',
        usage: [
            'Действие завершится к определённому моменту будущего',
        ],
        markers: ['by tomorrow', 'by 2030', 'by the time'],
        examples: [
            { en: 'I will have finished the report by Monday.', ru: 'Я закончу отчёт к понедельнику.' },
        ],
        mistakes: [
            {
                wrong: 'I will have finish it by five.',
                right: 'I will have finished it by five.',
                note: 'После have — третья форма глагола (V3).',
            },
        ],
    },
    // Perfect Continuous
    {
        id: 'present-perfect-continuous',
        name: 'Present Perfect Continuous',
        group: 'perfect-continuous',
        time: 'present',
        formula: {
            affirmative: 'have / has been + V-ing',
            negative: "haven't / hasn't been + V-ing",
            question: 'Have / Has … been + V-ing?',
        },
        shortFormula: 'have been + V-ing',
        shortExample: 'I have been working',
        usage: [
            'Процесс начался в прошлом и всё ещё идёт (акцент на длительности)',
            'Процесс только что закончился, но виден его след (устал, мокрый)',
        ],
        markers: ['for two hours', 'since morning', 'all day', 'lately'],
        examples: [
            { en: 'I have been learning English for three years.', ru: 'Я учу английский уже три года.' },
            { en: 'She is tired — she has been running.', ru: 'Она устала — она бегала.' },
        ],
        mistakes: [
            {
                wrong: 'I am learning English for three years.',
                right: 'I have been learning English for three years.',
                note: 'Длительность с for/since — Present Perfect Continuous, а не Present Continuous.',
            },
        ],
    },
    {
        id: 'past-perfect-continuous',
        name: 'Past Perfect Continuous',
        group: 'perfect-continuous',
        time: 'past',
        formula: {
            affirmative: 'had been + V-ing',
            negative: "hadn't been + V-ing",
            question: 'Had … been + V-ing?',
        },
        shortFormula: 'had been + V-ing',
        shortExample: 'I had been working',
        usage: [
            'Процесс длился вплоть до определённого момента в прошлом',
        ],
        markers: ['for an hour before', 'by the time'],
        examples: [
            { en: 'He had been waiting for an hour before the bus came.', ru: 'Он прождал час, прежде чем пришёл автобус.' },
        ],
        mistakes: [
            {
                wrong: 'He was waiting for an hour before the bus came.',
                right: 'He had been waiting for an hour before the bus came.',
                note: 'Длительность до прошлого события — Past Perfect Continuous.',
            },
        ],
    },
    {
        id: 'future-perfect-continuous',
        name: 'Future Perfect Continuous',
        group: 'perfect-continuous',
        time: 'future',
        formula: {
            affirmative: 'will have been + V-ing',
            negative: "won't have been + V-ing",
            question: 'Will … have been + V-ing?',
        },
        shortFormula: 'will have been + V-ing',
        shortExample: 'I will have been working',
        usage: [
            'К моменту будущего процесс будет длиться уже определённое время (употребляется редко)',
        ],
        markers: ['by next year … for', 'by the time … for'],
        examples: [
            { en: 'By June I will have been working here for ten years.', ru: 'К июню я буду работать здесь уже десять лет.' },
        ],
        mistakes: [],
    },
];

export const TENSE_COMPARISONS: TenseComparison[] = [
    {
        id: 'simple-vs-continuous',
        leftLabel: 'Present Simple',
        rightLabel: 'Present Continuous',
        leftTitle: 'Present Simple — как обычно?',
        leftNote: 'Регулярность, привычка или факт.',
        rightTitle: 'Present Continuous — что сейчас?',
        rightNote: 'Процесс идёт прямо сейчас или временно.',
        groups: ['simple', 'continuous'],
        rows: [
            {
                left: { en: 'I drink coffee every morning.', ru: 'Я пью кофе каждое утро (привычка).' },
                right: { en: 'I am drinking coffee now.', ru: 'Я пью кофе прямо сейчас (процесс).' },
            },
            {
                left: { en: 'She works in a bank.', ru: 'Она работает в банке (факт).' },
                right: { en: 'She is working from home this week.', ru: 'На этой неделе она работает из дома (временно).' },
            },
        ],
    },
    {
        id: 'past-simple-vs-present-perfect',
        leftLabel: 'Past Simple',
        rightLabel: 'Present Perfect',
        leftTitle: 'Past Simple — когда?',
        leftNote: 'Важен момент в прошлом, он назван или понятен.',
        rightTitle: 'Present Perfect — что сейчас?',
        rightNote: 'Важен результат к настоящему, время не важно.',
        groups: ['simple', 'perfect'],
        rows: [
            {
                left: { en: 'I lost my keys yesterday.', ru: 'Я потерял ключи вчера (известно когда).' },
                right: { en: 'I have lost my keys.', ru: 'Я потерял ключи (и сейчас без них).' },
            },
            {
                left: { en: 'Did you see this movie last week?', ru: 'Ты смотрел этот фильм на прошлой неделе?' },
                right: { en: 'Have you ever seen this movie?', ru: 'Ты вообще когда-нибудь видел этот фильм?' },
            },
        ],
    },
    {
        id: 'perfect-vs-perfect-continuous',
        leftLabel: 'Present Perfect',
        rightLabel: 'Present Perfect Continuous',
        leftTitle: 'Present Perfect — сколько сделано?',
        leftNote: 'Важен результат: что и сколько уже готово.',
        rightTitle: 'Present Perfect Continuous — как долго?',
        rightNote: 'Важна длительность процесса, а не результат.',
        groups: ['perfect', 'perfect-continuous'],
        rows: [
            {
                left: { en: 'I have written three letters.', ru: 'Я написал три письма (результат).' },
                right: { en: 'I have been writing letters all morning.', ru: 'Я пишу письма всё утро (процесс).' },
            },
        ],
    },
    {
        id: 'continuous-vs-perfect-continuous',
        leftLabel: 'Present Continuous',
        rightLabel: 'Present Perfect Continuous',
        leftTitle: 'Present Continuous — что сейчас?',
        leftNote: 'Процесс идёт в этот момент или период.',
        rightTitle: 'Present Perfect Continuous — как долго?',
        rightNote: 'Процесс идёт, и важно, сколько он уже длится.',
        groups: ['continuous', 'perfect-continuous'],
        rows: [
            {
                left: { en: 'I am learning English.', ru: 'Я учу английский (сейчас, в этот период).' },
                right: { en: 'I have been learning English for three years.', ru: 'Я учу английский уже три года.' },
            },
        ],
    },
];
