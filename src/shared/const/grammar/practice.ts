export interface PracticeExercise {
    id: string;
    /** id времени из TENSES: 'present-simple' и т.п. */
    tenseId: string;
    /** Английское предложение с пропуском ___. */
    text: string;
    /** Глагол-подсказка: 'work', 'not/like', 'just/finish'. */
    verb: string;
    /** Принимаемые ответы; первый — канонический. */
    answers: string[];
    /** Русский перевод предложения — данные задания, не через i18n. */
    translation: string;
}

/** Приведение ответа к сравнимому виду: регистр, апострофы, пробелы, конечная пунктуация. */
export const normalizeAnswer = (value: string): string => value
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/[.,!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const PRACTICE_EXERCISES: PracticeExercise[] = [
    // Present Simple
    {
        id: 'ps-1', tenseId: 'present-simple', text: 'She ___ in a bank.', verb: 'work', answers: ['works'], translation: 'Она работает в банке.',
    },
    {
        id: 'ps-2', tenseId: 'present-simple', text: 'I usually ___ up at seven.', verb: 'get', answers: ['get'], translation: 'Я обычно встаю в семь.',
    },
    {
        id: 'ps-3', tenseId: 'present-simple', text: 'He ___ coffee.', verb: 'not/like', answers: ["doesn't like", 'does not like'], translation: 'Он не любит кофе.',
    },
    {
        id: 'ps-4', tenseId: 'present-simple', text: 'Water ___ at 100 degrees.', verb: 'boil', answers: ['boils'], translation: 'Вода кипит при 100 градусах.',
    },
    // Past Simple
    {
        id: 'pas-1', tenseId: 'past-simple', text: 'We ___ a movie yesterday.', verb: 'watch', answers: ['watched'], translation: 'Вчера мы посмотрели фильм.',
    },
    {
        id: 'pas-2', tenseId: 'past-simple', text: 'She ___ to London last year.', verb: 'go', answers: ['went'], translation: 'В прошлом году она ездила в Лондон.',
    },
    {
        id: 'pas-3', tenseId: 'past-simple', text: 'I ___ him at the party.', verb: 'not/see', answers: ["didn't see", 'did not see'], translation: 'Я не видел его на вечеринке.',
    },
    {
        id: 'pas-4', tenseId: 'past-simple', text: 'Did you ___ the tickets?', verb: 'buy', answers: ['buy'], translation: 'Ты купил билеты?',
    },
    // Future Simple
    {
        id: 'fs-1', tenseId: 'future-simple', text: 'I think it ___ tomorrow.', verb: 'rain', answers: ['will rain', "'ll rain"], translation: 'Думаю, завтра будет дождь.',
    },
    {
        id: 'fs-2', tenseId: 'future-simple', text: "Don't worry, I ___ you.", verb: 'help', answers: ['will help', "'ll help"], translation: 'Не волнуйся, я тебе помогу.',
    },
    {
        id: 'fs-3', tenseId: 'future-simple', text: 'She ___ to the meeting.', verb: 'not/come', answers: ["won't come", 'will not come'], translation: 'Она не придёт на встречу.',
    },
    {
        id: 'fs-4', tenseId: 'future-simple', text: 'We ___ the results soon.', verb: 'know', answers: ['will know', "'ll know"], translation: 'Мы скоро узнаем результаты.',
    },
    // Present Continuous
    {
        id: 'pc-1', tenseId: 'present-continuous', text: 'Listen! Someone ___ .', verb: 'sing', answers: ['is singing'], translation: 'Послушай! Кто-то поёт.',
    },
    {
        id: 'pc-2', tenseId: 'present-continuous', text: 'I ___ an interesting book now.', verb: 'read', answers: ['am reading', "'m reading"], translation: 'Я сейчас читаю интересную книгу.',
    },
    {
        id: 'pc-3', tenseId: 'present-continuous', text: 'They ___ TV at the moment.', verb: 'not/watch', answers: ["aren't watching", 'are not watching'], translation: 'Они сейчас не смотрят телевизор.',
    },
    {
        id: 'pc-4', tenseId: 'present-continuous', text: 'We ___ to Rome on Friday.', verb: 'fly', answers: ['are flying'], translation: 'Мы летим в Рим в пятницу.',
    },
    // Past Continuous
    {
        id: 'pac-1', tenseId: 'past-continuous', text: 'At 8 pm I ___ dinner.', verb: 'cook', answers: ['was cooking'], translation: 'В восемь вечера я готовил ужин.',
    },
    {
        id: 'pac-2', tenseId: 'past-continuous', text: 'They ___ football all evening.', verb: 'play', answers: ['were playing'], translation: 'Они играли в футбол весь вечер.',
    },
    {
        id: 'pac-3', tenseId: 'past-continuous', text: 'I ___ when he called.', verb: 'read', answers: ['was reading'], translation: 'Я читал, когда он позвонил.',
    },
    {
        id: 'pac-4', tenseId: 'past-continuous', text: 'She ___ when you came.', verb: 'not/sleep', answers: ["wasn't sleeping", 'was not sleeping'], translation: 'Она не спала, когда ты пришёл.',
    },
    // Future Continuous
    {
        id: 'fc-1', tenseId: 'future-continuous', text: 'At noon tomorrow I ___ to Moscow.', verb: 'drive', answers: ['will be driving', "'ll be driving"], translation: 'Завтра в полдень я буду ехать в Москву.',
    },
    {
        id: 'fc-2', tenseId: 'future-continuous', text: 'This time next week we ___ in the sea.', verb: 'swim', answers: ['will be swimming', "'ll be swimming"], translation: 'В это время на следующей неделе мы будем купаться в море.',
    },
    {
        id: 'fc-3', tenseId: 'future-continuous', text: "Don't call at nine: she ___ .", verb: 'work', answers: ['will be working', "'ll be working"], translation: 'Не звони в девять: она будет работать.',
    },
    {
        id: 'fc-4', tenseId: 'future-continuous', text: 'Will you ___ the car tonight?', verb: 'use', answers: ['be using'], translation: 'Ты будешь пользоваться машиной сегодня вечером?',
    },
    // Present Perfect
    {
        id: 'pp-1', tenseId: 'present-perfect', text: 'I ___ my keys.', verb: 'lose', answers: ['have lost', "'ve lost"], translation: 'Я потерял ключи.',
    },
    {
        id: 'pp-2', tenseId: 'present-perfect', text: 'She ___ the report.', verb: 'just/finish', answers: ['has just finished'], translation: 'Она только что закончила отчёт.',
    },
    {
        id: 'pp-3', tenseId: 'present-perfect', text: 'We ___ each other since 2010.', verb: 'know', answers: ['have known', "'ve known"], translation: 'Мы знаем друг друга с 2010 года.',
    },
    {
        id: 'pp-4', tenseId: 'present-perfect', text: 'Have you ever ___ to London?', verb: 'be', answers: ['been'], translation: 'Ты когда-нибудь был в Лондоне?',
    },
    // Past Perfect
    {
        id: 'pap-1', tenseId: 'past-perfect', text: 'The train ___ before we arrived.', verb: 'leave', answers: ['had left', "'d left"], translation: 'Поезд ушёл до того, как мы приехали.',
    },
    {
        id: 'pap-2', tenseId: 'past-perfect', text: 'He said he ___ the movie.', verb: 'already/see', answers: ['had already seen', "'d already seen"], translation: 'Он сказал, что уже видел этот фильм.',
    },
    {
        id: 'pap-3', tenseId: 'past-perfect', text: 'By 2010 they ___ the bridge.', verb: 'build', answers: ['had built', "'d built"], translation: 'К 2010 году они построили мост.',
    },
    {
        id: 'pap-4', tenseId: 'past-perfect', text: 'I ___ breakfast when the taxi came.', verb: 'not/finish', answers: ["hadn't finished", 'had not finished'], translation: 'Я не закончил завтрак, когда приехало такси.',
    },
    // Future Perfect
    {
        id: 'fp-1', tenseId: 'future-perfect', text: 'I ___ the report by Monday.', verb: 'finish', answers: ['will have finished', "'ll have finished"], translation: 'Я закончу отчёт к понедельнику.',
    },
    {
        id: 'fp-2', tenseId: 'future-perfect', text: 'By June they ___ the house.', verb: 'build', answers: ['will have built', "'ll have built"], translation: 'К июню они построят дом.',
    },
    {
        id: 'fp-3', tenseId: 'future-perfect', text: 'She ___ the book by Friday.', verb: 'read', answers: ['will have read', "'ll have read"], translation: 'Она дочитает книгу к пятнице.',
    },
    {
        id: 'fp-4', tenseId: 'future-perfect', text: 'By 10 pm we ___ all the work.', verb: 'do', answers: ['will have done', "'ll have done"], translation: 'К десяти вечера мы сделаем всю работу.',
    },
    // Present Perfect Continuous
    {
        id: 'ppc-1', tenseId: 'present-perfect-continuous', text: 'I ___ English for three years.', verb: 'learn', answers: ['have been learning', "'ve been learning"], translation: 'Я учу английский уже три года.',
    },
    {
        id: 'ppc-2', tenseId: 'present-perfect-continuous', text: 'She is tired — she ___ .', verb: 'run', answers: ['has been running'], translation: 'Она устала — она бегала.',
    },
    {
        id: 'ppc-3', tenseId: 'present-perfect-continuous', text: 'It ___ since morning.', verb: 'rain', answers: ['has been raining'], translation: 'Дождь идёт с самого утра.',
    },
    {
        id: 'ppc-4', tenseId: 'present-perfect-continuous', text: 'They ___ for an hour.', verb: 'wait', answers: ['have been waiting', "'ve been waiting"], translation: 'Они ждут уже час.',
    },
    // Past Perfect Continuous
    {
        id: 'papc-1', tenseId: 'past-perfect-continuous', text: 'He ___ for an hour before the bus came.', verb: 'wait', answers: ['had been waiting', "'d been waiting"], translation: 'Он прождал час, прежде чем пришёл автобус.',
    },
    {
        id: 'papc-2', tenseId: 'past-perfect-continuous', text: 'She was wet because she ___ in the rain.', verb: 'walk', answers: ['had been walking', "'d been walking"], translation: 'Она промокла, потому что гуляла под дождём.',
    },
    {
        id: 'papc-3', tenseId: 'past-perfect-continuous', text: 'They ___ all day, so they were tired.', verb: 'work', answers: ['had been working', "'d been working"], translation: 'Они работали весь день, поэтому устали.',
    },
    {
        id: 'papc-4', tenseId: 'past-perfect-continuous', text: 'I ___ for two hours when you called.', verb: 'study', answers: ['had been studying', "'d been studying"], translation: 'Я занимался уже два часа, когда ты позвонил.',
    },
    // Future Perfect Continuous
    {
        id: 'fpc-1', tenseId: 'future-perfect-continuous', text: 'By June I ___ here for ten years.', verb: 'work', answers: ['will have been working', "'ll have been working"], translation: 'К июню я буду работать здесь уже десять лет.',
    },
    {
        id: 'fpc-2', tenseId: 'future-perfect-continuous', text: 'By 2030 she ___ for twenty years.', verb: 'teach', answers: ['will have been teaching', "'ll have been teaching"], translation: 'К 2030 году она будет преподавать уже двадцать лет.',
    },
    {
        id: 'fpc-3', tenseId: 'future-perfect-continuous', text: 'Next month we ___ here for a year.', verb: 'live', answers: ['will have been living', "'ll have been living"], translation: 'В следующем месяце будет год, как мы здесь живём.',
    },
    {
        id: 'fpc-4', tenseId: 'future-perfect-continuous', text: 'By evening he ___ for twelve hours.', verb: 'drive', answers: ['will have been driving', "'ll have been driving"], translation: 'К вечеру он будет за рулём уже двенадцать часов.',
    },
];
