export type GrammarTopicId =
    | 'word-order'
    | 'articles'
    | 'prepositions'
    | 'modals'
    | 'comparisons'
    | 'conditionals'
    | 'passive';

export type TopicLevel = 'A1' | 'A2' | 'B1';

export interface TopicExample {
    en: string;
    /** Русский перевод — ключ i18n. */
    ru: string;
}

export interface TopicRule {
    /** Крупная метка карточки правила: 'a / an', 'the', '1'; не переводится (кроме прочерка). */
    mark: string;
    /** Название правила — ключ i18n. */
    title: string;
    /** Формула/схема — ключ i18n (часть формул содержит русские пояснения). */
    formula?: string;
    /** Пояснение — ключ i18n. */
    note: string;
    examples: TopicExample[];
}

export interface TopicMistake {
    wrong: string;
    right: string;
    /** Пояснение — ключ i18n. */
    note: string;
}

export interface GrammarTopicInfo {
    id: GrammarTopicId;
    /** Название темы — ключ i18n. */
    name: string;
    /** Английское название темы, не переводится. */
    enName: string;
    level: TopicLevel;
    /** Суть темы в одном-двух предложениях — ключ i18n. */
    intro: string;
    rules: TopicRule[];
    mistakes: TopicMistake[];
}

/** Порядок — от базовых тем к продвинутым, используется для навигации «дальше/назад». */
export const GRAMMAR_TOPIC_ORDER: GrammarTopicId[] = [
    'word-order', 'articles', 'prepositions', 'modals', 'comparisons', 'conditionals', 'passive',
];

export const GRAMMAR_TOPICS: Record<GrammarTopicId, GrammarTopicInfo> = {
    'word-order': {
        id: 'word-order',
        name: 'Порядок слов и вопросы',
        enName: 'Word Order & Questions',
        level: 'A1',
        intro: 'В английском порядок слов фиксированный, а вопросы и отрицания строятся через вспомогательные глаголы. Это каркас, на который ложится вся остальная грамматика.',
        rules: [
            {
                mark: 'S + V + O',
                title: 'Утверждение',
                formula: 'Subject + Verb + Object',
                note: 'Подлежащее → сказуемое → дополнение. Обстоятельства времени и места обычно ставятся в конце.',
                examples: [
                    { en: 'She reads books in the evening.', ru: 'Она читает книги по вечерам.' },
                    { en: 'We watched a movie yesterday.', ru: 'Мы вчера посмотрели фильм.' },
                ],
            },
            {
                mark: 'Aux?',
                title: 'Общий вопрос',
                formula: 'Aux + Subject + V?',
                note: 'Вопрос начинается со вспомогательного глагола: do/does/did, am/is/are, will, have и т. д.',
                examples: [
                    { en: 'Do you like tea?', ru: 'Ты любишь чай?' },
                    { en: 'Is he at home?', ru: 'Он дома?' },
                ],
            },
            {
                mark: 'Wh-',
                title: 'Специальный вопрос',
                formula: 'Wh- + Aux + Subject + V?',
                note: 'Вопросительное слово (what, where, why, when, how) ставится перед вспомогательным глаголом.',
                examples: [
                    { en: 'Where do you live?', ru: 'Где ты живёшь?' },
                    { en: 'Why is she crying?', ru: 'Почему она плачет?' },
                ],
            },
            {
                mark: 'not',
                title: 'Отрицание',
                formula: 'Subject + Aux + not + V',
                note: 'Отрицание тоже строится через вспомогательный глагол + not.',
                examples: [
                    { en: "I don't eat meat.", ru: 'Я не ем мясо.' },
                    { en: "She isn't working today.", ru: 'Она сегодня не работает.' },
                ],
            },
        ],
        mistakes: [
            {
                wrong: 'You like coffee?',
                right: 'Do you like coffee?',
                note: 'Вопрос нельзя построить одной интонацией — нужен вспомогательный глагол.',
            },
            {
                wrong: 'Where you live?',
                right: 'Where do you live?',
                note: 'После вопросительного слова обязателен вспомогательный глагол.',
            },
        ],
    },
    articles: {
        id: 'articles',
        name: 'Артикли',
        enName: 'Articles: a / an / the',
        level: 'A1',
        intro: 'Артикль показывает, говорим мы о чём-то впервые упомянутом (a/an), о конкретном и известном (the) или об общем понятии (без артикля).',
        rules: [
            {
                mark: 'a / an',
                title: 'a / an — неопределённый',
                formula: 'a + согласный звук, an + гласный звук',
                note: 'Один из многих, впервые упомянутый. Только с исчисляемыми существительными в единственном числе.',
                examples: [
                    { en: 'I saw a dog in the park.', ru: 'Я видел (какую-то) собаку в парке.' },
                    { en: 'She is an engineer.', ru: 'Она инженер.' },
                ],
            },
            {
                mark: 'the',
                title: 'the — определённый',
                note: 'Конкретный предмет, известный обоим собеседникам, уже упомянутый или единственный в своём роде.',
                examples: [
                    { en: 'The dog was black.', ru: 'Собака (та самая) была чёрной.' },
                    { en: 'The sun rises in the east.', ru: 'Солнце встаёт на востоке.' },
                ],
            },
            {
                mark: '—',
                title: 'Нулевой артикль',
                note: 'Без артикля: множественное число в общем смысле, неисчисляемые понятия, имена, города, языки.',
                examples: [
                    { en: 'Cats are independent.', ru: 'Кошки (вообще) независимы.' },
                    { en: 'I like coffee.', ru: 'Я люблю кофе.' },
                ],
            },
        ],
        mistakes: [
            {
                wrong: 'She is teacher.',
                right: 'She is a teacher.',
                note: 'Профессия в единственном числе требует артикля a/an.',
            },
            {
                wrong: 'The life is beautiful.',
                right: 'Life is beautiful.',
                note: 'Абстрактные понятия в общем смысле употребляются без артикля.',
            },
        ],
    },
    prepositions: {
        id: 'prepositions',
        name: 'Предлоги времени и места',
        enName: 'Prepositions: in / on / at',
        level: 'A1',
        intro: 'Три главных предлога in, on, at работают и для времени, и для места — по принципу «большое → поверхность/день → точка».',
        rules: [
            {
                mark: 'in / on / at',
                title: 'Время: in / on / at',
                formula: 'in + месяц/год, on + день, at + час',
                note: 'in — длинные периоды (месяцы, годы, сезоны), on — дни и даты, at — точное время.',
                examples: [
                    { en: 'She was born in July.', ru: 'Она родилась в июле.' },
                    { en: 'We met on Monday.', ru: 'Мы встретились в понедельник.' },
                    { en: 'The lesson starts at 5 o’clock.', ru: 'Урок начинается в пять часов.' },
                ],
            },
            {
                mark: 'in / on / at',
                title: 'Место: in / on / at',
                note: 'in — внутри объёма, on — на поверхности, at — в точке или месте события.',
                examples: [
                    { en: 'The keys are in the bag.', ru: 'Ключи в сумке.' },
                    { en: 'The book is on the table.', ru: 'Книга на столе.' },
                    { en: 'We are at the station.', ru: 'Мы на вокзале.' },
                ],
            },
            {
                mark: 'to / from',
                title: 'Направление: to / from',
                note: 'to — движение куда-то, from — откуда-то. Исключение: home употребляется без to.',
                examples: [
                    { en: 'I go to work by bus.', ru: 'Я езжу на работу на автобусе.' },
                    { en: 'He came from London.', ru: 'Он приехал из Лондона.' },
                ],
            },
        ],
        mistakes: [
            {
                wrong: 'in Monday',
                right: 'on Monday',
                note: 'С днями недели употребляется on.',
            },
            {
                wrong: 'I went to home.',
                right: 'I went home.',
                note: 'Home употребляется без предлога to.',
            },
        ],
    },
    modals: {
        id: 'modals',
        name: 'Модальные глаголы',
        enName: 'Modal Verbs',
        level: 'A2',
        intro: 'Модальные глаголы выражают отношение к действию: умение, обязанность, совет, вероятность. После них идёт инфинитив без to, и они не изменяются по лицам.',
        rules: [
            {
                mark: 'can',
                title: 'can / could — умение и возможность',
                formula: 'can + V',
                note: 'can — умение и возможность сейчас, could — в прошлом или как вежливая просьба.',
                examples: [
                    { en: 'I can swim.', ru: 'Я умею плавать.' },
                    { en: 'Could you help me?', ru: 'Не могли бы вы мне помочь?' },
                ],
            },
            {
                mark: 'must',
                title: 'must / have to — необходимость',
                formula: 'must + V / have to + V',
                note: 'must — внутренняя обязанность или твёрдая уверенность, have to — необходимость извне (правила, обстоятельства).',
                examples: [
                    { en: 'I must finish this today.', ru: 'Я должен закончить это сегодня (сам так решил).' },
                    { en: 'I have to wear a uniform at work.', ru: 'Мне приходится носить форму на работе (правило).' },
                ],
            },
            {
                mark: 'should',
                title: 'should — совет',
                formula: 'should + V',
                note: 'Совет или рекомендация: «стоит, следует».',
                examples: [
                    { en: 'You should see a doctor.', ru: 'Тебе стоит сходить к врачу.' },
                ],
            },
            {
                mark: 'may',
                title: 'may / might — вероятность и разрешение',
                formula: 'may / might + V',
                note: 'may — разрешение и вероятность, might — более слабая вероятность.',
                examples: [
                    { en: 'It might rain tonight.', ru: 'Вечером, возможно, будет дождь.' },
                    { en: 'May I come in?', ru: 'Можно войти?' },
                ],
            },
        ],
        mistakes: [
            {
                wrong: 'He can to swim.',
                right: 'He can swim.',
                note: 'После модального глагола идёт инфинитив без to.',
            },
            {
                wrong: 'She musts go.',
                right: 'She must go.',
                note: 'Модальные глаголы не изменяются по лицам — окончание -s не добавляется.',
            },
        ],
    },
    comparisons: {
        id: 'comparisons',
        name: 'Степени сравнения',
        enName: 'Comparatives & Superlatives',
        level: 'A2',
        intro: 'Короткие прилагательные сравниваются окончаниями -er/-est, длинные — словами more/most, а несколько самых частых — исключения.',
        rules: [
            {
                mark: '-er',
                title: 'Короткие прилагательные',
                formula: 'big → bigger → the biggest',
                note: 'К прилагательным из 1–2 слогов добавляются -er (сравнительная) и -est (превосходная).',
                examples: [
                    { en: 'This box is bigger than that one.', ru: 'Эта коробка больше той.' },
                    { en: 'It is the biggest box of all.', ru: 'Это самая большая коробка из всех.' },
                ],
            },
            {
                mark: 'more',
                title: 'Длинные прилагательные',
                formula: 'more + adj → the most + adj',
                note: 'К прилагательным из 3+ слогов добавляются more и the most.',
                examples: [
                    { en: 'This film is more interesting than the book.', ru: 'Этот фильм интереснее книги.' },
                    { en: 'It is the most expensive hotel in the city.', ru: 'Это самый дорогой отель в городе.' },
                ],
            },
            {
                mark: 'better',
                title: 'Исключения',
                formula: 'good → better → the best; bad → worse → the worst',
                note: 'Несколько частых прилагательных образуют степени не по правилам — их нужно запомнить.',
                examples: [
                    { en: 'She sings better than me.', ru: 'Она поёт лучше меня.' },
                    { en: 'It was the worst day of my life.', ru: 'Это был худший день в моей жизни.' },
                ],
            },
            {
                mark: 'as … as',
                title: 'as … as — «такой же, как»',
                formula: 'as + adj + as',
                note: 'Равенство выражается конструкцией as … as, неравенство — not as … as.',
                examples: [
                    { en: 'He is as tall as his father.', ru: 'Он такой же высокий, как его отец.' },
                ],
            },
        ],
        mistakes: [
            {
                wrong: 'This is more better.',
                right: 'This is better.',
                note: 'More не сочетается с формой, которая уже стоит в сравнительной степени.',
            },
            {
                wrong: 'This task is more easy.',
                right: 'This task is easier.',
                note: 'Короткие прилагательные сравниваются окончанием -er, а не словом more.',
            },
        ],
    },
    conditionals: {
        id: 'conditionals',
        name: 'Условные предложения',
        enName: 'Conditionals 0–3',
        level: 'B1',
        intro: 'Четыре типа условий — от общих истин до нереального прошлого. Ключевое правило: в части с if не бывает will и would.',
        rules: [
            {
                mark: '0',
                title: 'Zero Conditional — общие истины',
                formula: 'If + Present Simple, Present Simple',
                note: 'Законы природы и вещи, которые верны всегда.',
                examples: [
                    { en: 'If you heat water, it boils.', ru: 'Если нагреть воду, она закипает.' },
                ],
            },
            {
                mark: '1',
                title: 'First Conditional — реальное будущее',
                formula: 'If + Present Simple, will + V',
                note: 'Реальное условие в будущем: вполне может произойти.',
                examples: [
                    { en: 'If it rains, we will stay home.', ru: 'Если пойдёт дождь, мы останемся дома.' },
                ],
            },
            {
                mark: '2',
                title: 'Second Conditional — нереальное настоящее',
                formula: 'If + Past Simple, would + V',
                note: 'Воображаемая ситуация сейчас или в будущем: «если бы, то бы».',
                examples: [
                    { en: 'If I had a million, I would travel the world.', ru: 'Если бы у меня был миллион, я бы путешествовал по миру.' },
                ],
            },
            {
                mark: '3',
                title: 'Third Conditional — нереальное прошлое',
                formula: 'If + Past Perfect, would have + V3',
                note: 'Сожаление о прошлом: условие уже не может исполниться.',
                examples: [
                    { en: 'If you had called me, I would have come.', ru: 'Если бы ты мне позвонил, я бы пришёл.' },
                ],
            },
        ],
        mistakes: [
            {
                wrong: 'If it will rain, we will stay home.',
                right: 'If it rains, we will stay home.',
                note: 'В части с if будущее выражается настоящим временем — will не ставится.',
            },
            {
                wrong: 'If I would know the answer, I would tell you.',
                right: 'If I knew the answer, I would tell you.',
                note: 'Во втором типе условия после if идёт Past Simple, а не would.',
            },
        ],
    },
    passive: {
        id: 'passive',
        name: 'Пассивный залог',
        enName: 'Passive Voice',
        level: 'B1',
        intro: 'Пассив нужен, когда важно само действие или его объект, а не тот, кто действует. Формула всегда одна: be в нужном времени + V3.',
        rules: [
            {
                mark: 'be + V3',
                title: 'Базовая формула',
                formula: 'be + V3',
                note: 'Время выражается формой be, смысловой глагол всегда в третьей форме.',
                examples: [
                    { en: 'This house was built in 1990.', ru: 'Этот дом был построен в 1990 году.' },
                    { en: 'English is spoken all over the world.', ru: 'На английском говорят по всему миру.' },
                ],
            },
            {
                mark: 'is made',
                title: 'Пассив в разных временах',
                formula: 'is made / was made / will be made / has been made',
                note: 'Меняется только форма be — по ней и определяется время.',
                examples: [
                    { en: 'The letter has been sent.', ru: 'Письмо уже отправлено.' },
                    { en: 'The road is being repaired.', ru: 'Дорогу сейчас ремонтируют.' },
                ],
            },
            {
                mark: 'by',
                title: 'by — кто выполнил действие',
                formula: '… + by + деятель',
                note: 'Деятель упоминается через by, только если это действительно важно.',
                examples: [
                    { en: 'The book was written by my favourite author.', ru: 'Книга написана моим любимым автором.' },
                ],
            },
        ],
        mistakes: [
            {
                wrong: 'The house built in 1990.',
                right: 'The house was built in 1990.',
                note: 'Без be получается активный залог — глагол be обязателен.',
            },
            {
                wrong: 'He was gave a prize.',
                right: 'He was given a prize.',
                note: 'После be употребляется третья форма глагола (V3).',
            },
        ],
    },
};
