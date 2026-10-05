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
    /** Короткое пояснение, показывается при ошибке. */
    tip: string;
}

/** Приведение ответа к сравнимому виду: регистр, апострофы, пробелы, конечная пунктуация. */
export const normalizeAnswer = (value: string): string => value
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/[.,!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Заданий в наборе практики времён */
export const PRACTICE_TASKS_COUNT = 6;

export const PRACTICE_EXERCISES: PracticeExercise[] = [
    // Present Simple
    {
        id: 'ps-1', tenseId: 'present-simple', text: 'She ___ in a bank.', verb: 'work', answers: ['works'], translation: 'Она работает в банке.', tip: 'Третье лицо ед. числа: глагол + -s.',
    },
    {
        id: 'ps-2', tenseId: 'present-simple', text: 'I usually ___ up at seven.', verb: 'get', answers: ['get'], translation: 'Я обычно встаю в семь.', tip: 'Привычка, подлежащее I — базовая форма без -s.',
    },
    {
        id: 'ps-3', tenseId: 'present-simple', text: 'He ___ coffee.', verb: 'not/like', answers: ["doesn't like", 'does not like'], translation: 'Он не любит кофе.', tip: 'Отрицание в 3-м лице: doesn\'t + базовая форма.',
    },
    {
        id: 'ps-4', tenseId: 'present-simple', text: 'Water ___ at 100 degrees.', verb: 'boil', answers: ['boils'], translation: 'Вода кипит при 100 градусах.', tip: 'Общеизвестный факт — Present Simple, 3-е лицо + -s.',
    },
    {
        id: 'ps-5', tenseId: 'present-simple', text: 'My brother ___ in Berlin.', verb: 'live', answers: ['lives'], translation: 'Мой брат живёт в Берлине.', tip: 'Постоянный факт, 3-е лицо: lives.',
    },
    {
        id: 'ps-6', tenseId: 'present-simple', text: 'Does she ___ English?', verb: 'speak', answers: ['speak'], translation: 'Она говорит по-английски?', tip: 'После does глагол в базовой форме, без -s.',
    },
    {
        id: 'ps-7', tenseId: 'present-simple', text: 'We ___ to work by bus.', verb: 'go', answers: ['go'], translation: 'Мы ездим на работу на автобусе.', tip: 'I/we/you/they — базовая форма без -s.',
    },
    {
        id: 'ps-8', tenseId: 'present-simple', text: 'The shop ___ at 9 am.', verb: 'open', answers: ['opens'], translation: 'Магазин открывается в девять утра.', tip: 'Расписания и графики — Present Simple.',
    },
    {
        id: 'ps-9', tenseId: 'present-simple', text: 'They ___ meat.', verb: 'not/eat', answers: ["don't eat", 'do not eat'], translation: 'Они не едят мясо.', tip: 'Отрицание: don\'t + базовая форма.',
    },
    // Past Simple
    {
        id: 'pas-1', tenseId: 'past-simple', text: 'We ___ a movie yesterday.', verb: 'watch', answers: ['watched'], translation: 'Вчера мы посмотрели фильм.', tip: 'Момент прошлого назван (yesterday) — Past Simple.',
    },
    {
        id: 'pas-2', tenseId: 'past-simple', text: 'She ___ to London last year.', verb: 'go', answers: ['went'], translation: 'В прошлом году она ездила в Лондон.', tip: 'Неправильный глагол: go — went.',
    },
    {
        id: 'pas-3', tenseId: 'past-simple', text: 'I ___ him at the party.', verb: 'not/see', answers: ["didn't see", 'did not see'], translation: 'Я не видел его на вечеринке.', tip: 'Отрицание: didn\'t + базовая форма.',
    },
    {
        id: 'pas-4', tenseId: 'past-simple', text: 'Did you ___ the tickets?', verb: 'buy', answers: ['buy'], translation: 'Ты купил билеты?', tip: 'После did — базовая форма глагола.',
    },
    {
        id: 'pas-5', tenseId: 'past-simple', text: 'I ___ him two days ago.', verb: 'meet', answers: ['met'], translation: 'Я встретил его два дня назад.', tip: 'Неправильный глагол: meet — met.',
    },
    {
        id: 'pas-6', tenseId: 'past-simple', text: 'She ___ a letter last night.', verb: 'write', answers: ['wrote'], translation: 'Вчера вечером она написала письмо.', tip: 'Неправильный глагол: write — wrote.',
    },
    {
        id: 'pas-7', tenseId: 'past-simple', text: 'Did they ___ the game?', verb: 'win', answers: ['win'], translation: 'Они выиграли матч?', tip: 'После did — базовая форма глагола.',
    },
    {
        id: 'pas-8', tenseId: 'past-simple', text: 'He ___ at the hotel in 2019.', verb: 'stay', answers: ['stayed'], translation: 'В 2019 году он останавливался в отеле.', tip: 'Правильный глагол: + -ed; время названо (in 2019).',
    },
    {
        id: 'pas-9', tenseId: 'past-simple', text: 'We ___ to the radio and cooked.', verb: 'listen', answers: ['listened'], translation: 'Мы слушали радио и готовили.', tip: 'Цепочка прошлых событий — все глаголы в Past Simple.',
    },
    // Future Simple
    {
        id: 'fs-1', tenseId: 'future-simple', text: 'I think it ___ tomorrow.', verb: 'rain', answers: ['will rain', "'ll rain"], translation: 'Думаю, завтра будет дождь.', tip: 'Предсказание: will + базовая форма.',
    },
    {
        id: 'fs-2', tenseId: 'future-simple', text: "Don't worry, I ___ you.", verb: 'help', answers: ['will help', "'ll help"], translation: 'Не волнуйся, я тебе помогу.', tip: 'Спонтанное обещание в момент речи — will.',
    },
    {
        id: 'fs-3', tenseId: 'future-simple', text: 'She ___ to the meeting.', verb: 'not/come', answers: ["won't come", 'will not come'], translation: 'Она не придёт на встречу.', tip: 'Отрицание: won\'t + базовая форма.',
    },
    {
        id: 'fs-4', tenseId: 'future-simple', text: 'We ___ the results soon.', verb: 'know', answers: ['will know', "'ll know"], translation: 'Мы скоро узнаем результаты.', tip: 'will + базовая форма, без to.',
    },
    {
        id: 'fs-5', tenseId: 'future-simple', text: "I'm tired — I ___ a taxi.", verb: 'take', answers: ['will take', "'ll take"], translation: 'Я устал — возьму такси.', tip: 'Решение принято в момент речи — will.',
    },
    {
        id: 'fs-6', tenseId: 'future-simple', text: 'She ___ you tomorrow.', verb: 'call', answers: ['will call', "'ll call"], translation: 'Она позвонит тебе завтра.', tip: 'will + базовая форма, без to.',
    },
    {
        id: 'fs-7', tenseId: 'future-simple', text: 'Will you ___ me with this box?', verb: 'help', answers: ['help'], translation: 'Поможешь мне с этой коробкой?', tip: 'В вопросе после will — базовая форма.',
    },
    {
        id: 'fs-8', tenseId: 'future-simple', text: 'I promise I ___ anyone.', verb: 'not/tell', answers: ["won't tell", 'will not tell'], translation: 'Обещаю, я никому не скажу.', tip: 'Обещание: won\'t + базовая форма.',
    },
    {
        id: 'fs-9', tenseId: 'future-simple', text: 'It ___ cold next week.', verb: 'be', answers: ['will be', "'ll be"], translation: 'На следующей неделе будет холодно.', tip: 'Факт о будущем: will be.',
    },
    // Present Continuous
    {
        id: 'pc-1', tenseId: 'present-continuous', text: 'Listen! Someone ___ .', verb: 'sing', answers: ['is singing', "'s singing"], translation: 'Послушай! Кто-то поёт.', tip: 'Процесс прямо сейчас: is + V-ing.',
    },
    {
        id: 'pc-2', tenseId: 'present-continuous', text: 'I ___ an interesting book now.', verb: 'read', answers: ['am reading', "'m reading"], translation: 'Я сейчас читаю интересную книгу.', tip: 'Для I: am + V-ing.',
    },
    {
        id: 'pc-3', tenseId: 'present-continuous', text: 'They ___ TV at the moment.', verb: 'not/watch', answers: ["aren't watching", 'are not watching'], translation: 'Они сейчас не смотрят телевизор.', tip: 'Отрицание: aren\'t + V-ing.',
    },
    {
        id: 'pc-4', tenseId: 'present-continuous', text: 'We ___ to Rome on Friday.', verb: 'fly', answers: ['are flying', "'re flying"], translation: 'Мы летим в Рим в пятницу.', tip: 'Запланированное будущее с датой — Present Continuous.',
    },
    {
        id: 'pc-5', tenseId: 'present-continuous', text: 'Be quiet! The baby ___ .', verb: 'sleep', answers: ['is sleeping', "'s sleeping"], translation: 'Тихо! Малыш спит.', tip: 'Действие идёт в момент речи: is + V-ing.',
    },
    {
        id: 'pc-6', tenseId: 'present-continuous', text: 'I ___ for my keys.', verb: 'look', answers: ['am looking', "'m looking"], translation: 'Я ищу свои ключи.', tip: 'Процесс сейчас, для I: am + V-ing.',
    },
    {
        id: 'pc-7', tenseId: 'present-continuous', text: 'They ___ a new school this year.', verb: 'build', answers: ['are building', "'re building"], translation: 'В этом году они строят новую школу.', tip: 'Временная ситуация «в этот период» — Continuous.',
    },
    {
        id: 'pc-8', tenseId: 'present-continuous', text: 'She ___ a red dress today.', verb: 'wear', answers: ['is wearing', "'s wearing"], translation: 'Сегодня на ней красное платье.', tip: 'Сегодня, а не всегда: is wearing, не wears.',
    },
    {
        id: 'pc-9', tenseId: 'present-continuous', text: 'We ___ dinner with them on Saturday.', verb: 'have', answers: ['are having', "'re having"], translation: 'В субботу мы ужинаем с ними.', tip: 'Договорённость с датой — Present Continuous.',
    },
    // Past Continuous
    {
        id: 'pac-1', tenseId: 'past-continuous', text: 'At 8 pm I ___ dinner.', verb: 'cook', answers: ['was cooking'], translation: 'В восемь вечера я готовил ужин.', tip: 'Процесс в конкретный момент прошлого: was + V-ing.',
    },
    {
        id: 'pac-2', tenseId: 'past-continuous', text: 'They ___ football all evening.', verb: 'play', answers: ['were playing'], translation: 'Они играли в футбол весь вечер.', tip: 'Длительное действие «весь вечер» — were + V-ing.',
    },
    {
        id: 'pac-3', tenseId: 'past-continuous', text: 'I ___ when he called.', verb: 'read', answers: ['was reading'], translation: 'Я читал, когда он позвонил.', tip: 'Фоновый процесс — Past Continuous, событие — Past Simple.',
    },
    {
        id: 'pac-4', tenseId: 'past-continuous', text: 'She ___ when you came.', verb: 'not/sleep', answers: ["wasn't sleeping", 'was not sleeping'], translation: 'Она не спала, когда ты пришёл.', tip: 'Отрицание: wasn\'t + V-ing.',
    },
    {
        id: 'pac-5', tenseId: 'past-continuous', text: 'They ___ tennis at 5 pm.', verb: 'play', answers: ['were playing'], translation: 'В пять часов они играли в теннис.', tip: 'Момент прошлого назван — процесс: were + V-ing.',
    },
    {
        id: 'pac-6', tenseId: 'past-continuous', text: 'While I ___ , the phone rang.', verb: 'cook', answers: ['was cooking'], translation: 'Пока я готовил, зазвонил телефон.', tip: 'While + процесс: was + V-ing.',
    },
    {
        id: 'pac-7', tenseId: 'past-continuous', text: 'It ___ when we left.', verb: 'rain', answers: ['was raining'], translation: 'Когда мы уходили, шёл дождь.', tip: 'Фон в прошлом: was raining.',
    },
    {
        id: 'pac-8', tenseId: 'past-continuous', text: 'He ___ attention at the lesson.', verb: 'not/pay', answers: ["wasn't paying", 'was not paying'], translation: 'Он не слушал на уроке.', tip: 'Отрицание: wasn\'t + V-ing.',
    },
    {
        id: 'pac-9', tenseId: 'past-continuous', text: 'The children ___ in the garden all morning.', verb: 'run', answers: ['were running'], translation: 'Дети бегали в саду всё утро.', tip: '«Всё утро» — длительный процесс: were + V-ing.',
    },
    // Future Continuous
    {
        id: 'fc-1', tenseId: 'future-continuous', text: 'At noon tomorrow I ___ to Moscow.', verb: 'drive', answers: ['will be driving', "'ll be driving"], translation: 'Завтра в полдень я буду ехать в Москву.', tip: 'Процесс в момент будущего: will be + V-ing.',
    },
    {
        id: 'fc-2', tenseId: 'future-continuous', text: 'This time next week we ___ in the sea.', verb: 'swim', answers: ['will be swimming', "'ll be swimming"], translation: 'В это время на следующей неделе мы будем купаться в море.', tip: '«В это время» в будущем — Future Continuous.',
    },
    {
        id: 'fc-3', tenseId: 'future-continuous', text: "Don't call at nine: she ___ .", verb: 'work', answers: ['will be working', "'ll be working"], translation: 'Не звони в девять: она будет работать.', tip: 'Действие будет в разгаре: will be + V-ing.',
    },
    {
        id: 'fc-4', tenseId: 'future-continuous', text: 'Will you ___ the car tonight?', verb: 'use', answers: ['be using'], translation: 'Ты будешь пользоваться машиной сегодня вечером?', tip: 'В вопросе после will: … be + V-ing.',
    },
    {
        id: 'fc-5', tenseId: 'future-continuous', text: 'At 8 pm I ___ dinner with my parents.', verb: 'have', answers: ['will be having', "'ll be having"], translation: 'В восемь вечера я буду ужинать с родителями.', tip: 'Процесс в момент будущего: will be + V-ing.',
    },
    {
        id: 'fc-6', tenseId: 'future-continuous', text: 'Tomorrow at ten she ___ an exam.', verb: 'take', answers: ['will be taking', "'ll be taking"], translation: 'Завтра в десять она будет сдавать экзамен.', tip: 'Момент будущего назван — will be + V-ing.',
    },
    {
        id: 'fc-7', tenseId: 'future-continuous', text: 'We ___ for you at the station.', verb: 'wait', answers: ['will be waiting', "'ll be waiting"], translation: 'Мы будем ждать тебя на вокзале.', tip: 'Процесс в будущем: will be waiting.',
    },
    {
        id: 'fc-8', tenseId: 'future-continuous', text: 'This time on Friday they ___ over the ocean.', verb: 'fly', answers: ['will be flying', "'ll be flying"], translation: 'В это время в пятницу они будут лететь над океаном.', tip: '«В это время в пятницу» — Future Continuous.',
    },
    {
        id: 'fc-9', tenseId: 'future-continuous', text: 'I ___ the car tomorrow, take it.', verb: 'not/use', answers: ["won't be using", 'will not be using'], translation: 'Завтра машина мне не нужна — бери.', tip: 'Отрицание: won\'t be + V-ing.',
    },
    // Present Perfect
    {
        id: 'pp-1', tenseId: 'present-perfect', text: 'I ___ my keys.', verb: 'lose', answers: ['have lost', "'ve lost"], translation: 'Я потерял ключи.', tip: 'Результат к настоящему: have + V3.',
    },
    {
        id: 'pp-2', tenseId: 'present-perfect', text: 'She ___ the report.', verb: 'just/finish', answers: ['has just finished', "'s just finished"], translation: 'Она только что закончила отчёт.', tip: 'just ставится между has и V3.',
    },
    {
        id: 'pp-3', tenseId: 'present-perfect', text: 'We ___ each other since 2010.', verb: 'know', answers: ['have known', "'ve known"], translation: 'Мы знаем друг друга с 2010 года.', tip: 'since — Present Perfect: have + V3.',
    },
    {
        id: 'pp-4', tenseId: 'present-perfect', text: 'Have you ever ___ to London?', verb: 'be', answers: ['been'], translation: 'Ты когда-нибудь был в Лондоне?', tip: 'Опыт за жизнь: Have you ever been…',
    },
    {
        id: 'pp-5', tenseId: 'present-perfect', text: 'She ___ her homework, she can play.', verb: 'finish', answers: ['has finished', "'s finished"], translation: 'Она сделала уроки — может играть.', tip: 'Результат к настоящему: has + V3.',
    },
    {
        id: 'pp-6', tenseId: 'present-perfect', text: 'I ___ this movie three times.', verb: 'see', answers: ['have seen', "'ve seen"], translation: 'Я видел этот фильм три раза.', tip: 'Опыт «сколько раз», дата не названа — Present Perfect.',
    },
    {
        id: 'pp-7', tenseId: 'present-perfect', text: 'We ___ here since May.', verb: 'live', answers: ['have lived', "'ve lived", 'have been living', "'ve been living"], translation: 'Мы живём здесь с мая.', tip: 'since — действие длится до сих пор: have + V3.',
    },
    {
        id: 'pp-8', tenseId: 'present-perfect', text: 'She ___ her leg.', verb: 'break', answers: ['has broken', "'s broken"], translation: 'Она сломала ногу.', tip: 'have/has + третья форма: break — broken.',
    },
    {
        id: 'pp-9', tenseId: 'present-perfect', text: 'They ___ yet.', verb: 'not/arrive', answers: ["haven't arrived", 'have not arrived'], translation: 'Они ещё не приехали.', tip: 'yet в отрицании — Present Perfect: haven\'t + V3.',
    },
    // Past Perfect
    {
        id: 'pap-1', tenseId: 'past-perfect', text: 'The train ___ before we arrived.', verb: 'leave', answers: ['had left', "'d left"], translation: 'Поезд ушёл до того, как мы приехали.', tip: 'Более раннее из двух прошлых действий — had + V3.',
    },
    {
        id: 'pap-2', tenseId: 'past-perfect', text: 'He said he ___ the movie.', verb: 'already/see', answers: ['had already seen', "'d already seen"], translation: 'Он сказал, что уже видел этот фильм.', tip: 'already ставится между had и V3.',
    },
    {
        id: 'pap-3', tenseId: 'past-perfect', text: 'By 2010 they ___ the bridge.', verb: 'build', answers: ['had built', "'d built"], translation: 'К 2010 году они построили мост.', tip: 'К моменту прошлого (by 2010) — had + V3.',
    },
    {
        id: 'pap-4', tenseId: 'past-perfect', text: 'I ___ breakfast when the taxi came.', verb: 'not/finish', answers: ["hadn't finished", 'had not finished'], translation: 'Я не закончил завтрак, когда приехало такси.', tip: 'Отрицание: hadn\'t + V3.',
    },
    {
        id: 'pap-5', tenseId: 'past-perfect', text: 'The film ___ by the time we came.', verb: 'already/start', answers: ['had already started', "'d already started"], translation: 'Фильм уже начался к нашему приходу.', tip: 'by the time — более раннее действие: had + V3.',
    },
    {
        id: 'pap-6', tenseId: 'past-perfect', text: 'I was sure I ___ the door.', verb: 'lock', answers: ['had locked', "'d locked"], translation: 'Я был уверен, что запер дверь.', tip: '«Прошлое до прошлого»: had + V3.',
    },
    {
        id: 'pap-7', tenseId: 'past-perfect', text: 'He told me he ___ in Paris before.', verb: 'never/be', answers: ['had never been', "'d never been"], translation: 'Он сказал, что никогда раньше не был в Париже.', tip: 'had + never + V3 — опыт до момента в прошлом.',
    },
    {
        id: 'pap-8', tenseId: 'past-perfect', text: 'After the guests ___ , we cleaned up.', verb: 'leave', answers: ['had left', "'d left"], translation: 'После того как гости ушли, мы убрались.', tip: 'After + Past Perfect у более раннего действия.',
    },
    {
        id: 'pap-9', tenseId: 'past-perfect', text: 'They ___ the project before the deadline.', verb: 'finish', answers: ['had finished', "'d finished"], translation: 'Они закончили проект до дедлайна.', tip: 'Завершилось до прошлого момента — had + V3.',
    },
    // Future Perfect
    {
        id: 'fp-1', tenseId: 'future-perfect', text: 'I ___ the report by Monday.', verb: 'finish', answers: ['will have finished', "'ll have finished"], translation: 'Я закончу отчёт к понедельнику.', tip: 'К сроку в будущем: will have + V3.',
    },
    {
        id: 'fp-2', tenseId: 'future-perfect', text: 'By June they ___ the house.', verb: 'build', answers: ['will have built', "'ll have built"], translation: 'К июню они построят дом.', tip: 'by June — Future Perfect: will have + V3.',
    },
    {
        id: 'fp-3', tenseId: 'future-perfect', text: 'She ___ the book by Friday.', verb: 'read', answers: ['will have read', "'ll have read"], translation: 'Она дочитает книгу к пятнице.', tip: 'will have + третья форма (V3).',
    },
    {
        id: 'fp-4', tenseId: 'future-perfect', text: 'By 10 pm we ___ all the work.', verb: 'do', answers: ['will have done', "'ll have done"], translation: 'К десяти вечера мы сделаем всю работу.', tip: 'Результат к моменту будущего — will have + V3.',
    },
    {
        id: 'fp-5', tenseId: 'future-perfect', text: 'By next week I ___ this book.', verb: 'finish', answers: ['will have finished', "'ll have finished"], translation: 'К следующей неделе я закончу эту книгу.', tip: 'by + срок — Future Perfect.',
    },
    {
        id: 'fp-6', tenseId: 'future-perfect', text: 'She ___ dinner by seven.', verb: 'cook', answers: ['will have cooked', "'ll have cooked"], translation: 'К семи она приготовит ужин.', tip: 'К моменту будущего: will have + V3.',
    },
    {
        id: 'fp-7', tenseId: 'future-perfect', text: 'By 2030 we ___ to a new house.', verb: 'move', answers: ['will have moved', "'ll have moved"], translation: 'К 2030 году мы переедем в новый дом.', tip: 'will have + V3 — результат к сроку.',
    },
    {
        id: 'fp-8', tenseId: 'future-perfect', text: 'They ___ the bridge by summer.', verb: 'not/build', answers: ["won't have built", 'will not have built'], translation: 'К лету они не достроят мост.', tip: 'Отрицание: won\'t have + V3.',
    },
    {
        id: 'fp-9', tenseId: 'future-perfect', text: 'By Monday he ___ everything.', verb: 'learn', answers: ['will have learnt', 'will have learned', "'ll have learnt", "'ll have learned"], translation: 'К понедельнику он всё выучит.', tip: 'will have + V3; у learn две формы: learnt/learned.',
    },
    // Present Perfect Continuous
    {
        id: 'ppc-1', tenseId: 'present-perfect-continuous', text: 'I ___ English for three years.', verb: 'learn', answers: ['have been learning', "'ve been learning"], translation: 'Я учу английский уже три года.', tip: 'Длительность с for: have been + V-ing.',
    },
    {
        id: 'ppc-2', tenseId: 'present-perfect-continuous', text: 'She is tired — she ___ .', verb: 'run', answers: ['has been running', "'s been running"], translation: 'Она устала — она бегала.', tip: 'Виден след процесса: has been + V-ing.',
    },
    {
        id: 'ppc-3', tenseId: 'present-perfect-continuous', text: 'It ___ since morning.', verb: 'rain', answers: ['has been raining', "'s been raining"], translation: 'Дождь идёт с самого утра.', tip: 'since morning — процесс длится до сих пор.',
    },
    {
        id: 'ppc-4', tenseId: 'present-perfect-continuous', text: 'They ___ for an hour.', verb: 'wait', answers: ['have been waiting', "'ve been waiting"], translation: 'Они ждут уже час.', tip: 'for an hour — акцент на длительности.',
    },
    {
        id: 'ppc-5', tenseId: 'present-perfect-continuous', text: 'My eyes hurt — I ___ all day.', verb: 'read', answers: ['have been reading', "'ve been reading"], translation: 'Глаза болят — я читал весь день.', tip: 'След процесса заметен сейчас: have been + V-ing.',
    },
    {
        id: 'ppc-6', tenseId: 'present-perfect-continuous', text: 'He ___ here since 2015.', verb: 'work', answers: ['has been working', "'s been working"], translation: 'Он работает здесь с 2015 года.', tip: 'since — процесс продолжается: has been + V-ing.',
    },
    {
        id: 'ppc-7', tenseId: 'present-perfect-continuous', text: 'She ___ for the exam all week.', verb: 'prepare', answers: ['has been preparing', "'s been preparing"], translation: 'Она готовится к экзамену всю неделю.', tip: 'Акцент на длительности: has been + V-ing.',
    },
    {
        id: 'ppc-8', tenseId: 'present-perfect-continuous', text: 'They ___ about the trip for hours.', verb: 'talk', answers: ['have been talking', "'ve been talking"], translation: 'Они часами говорят о поездке.', tip: 'for hours — длительность: have been + V-ing.',
    },
    {
        id: 'ppc-9', tenseId: 'present-perfect-continuous', text: 'It ___ all night.', verb: 'snow', answers: ['has been snowing', "'s been snowing"], translation: 'Снег идёт всю ночь.', tip: 'Процесс с ночи до сейчас — has been + V-ing.',
    },
    // Past Perfect Continuous
    {
        id: 'papc-1', tenseId: 'past-perfect-continuous', text: 'He ___ for an hour before the bus came.', verb: 'wait', answers: ['had been waiting', "'d been waiting"], translation: 'Он прождал час, прежде чем пришёл автобус.', tip: 'Процесс длился до прошлого события: had been + V-ing.',
    },
    {
        id: 'papc-2', tenseId: 'past-perfect-continuous', text: 'She was wet because she ___ in the rain.', verb: 'walk', answers: ['had been walking', "'d been walking"], translation: 'Она промокла, потому что гуляла под дождём.', tip: 'Причина-процесс в прошлом — had been + V-ing.',
    },
    {
        id: 'papc-3', tenseId: 'past-perfect-continuous', text: 'They ___ all day, so they were tired.', verb: 'work', answers: ['had been working', "'d been working"], translation: 'Они работали весь день, поэтому устали.', tip: 'Длились весь день до того — Past Perfect Continuous.',
    },
    {
        id: 'papc-4', tenseId: 'past-perfect-continuous', text: 'I ___ for two hours when you called.', verb: 'study', answers: ['had been studying', "'d been studying"], translation: 'Я занимался уже два часа, когда ты позвонил.', tip: 'Процесс шёл к моменту прошлого: had been + V-ing.',
    },
    {
        id: 'papc-5', tenseId: 'past-perfect-continuous', text: 'His hands were dirty — he ___ the car.', verb: 'fix', answers: ['had been fixing', "'d been fixing"], translation: 'Руки были грязные — он чинил машину.', tip: 'След процесса в прошлом: had been + V-ing.',
    },
    {
        id: 'papc-6', tenseId: 'past-perfect-continuous', text: 'She ___ for years before she won.', verb: 'train', answers: ['had been training', "'d been training"], translation: 'Она тренировалась годами, прежде чем победила.', tip: 'Длительность до прошлого события — had been + V-ing.',
    },
    {
        id: 'papc-7', tenseId: 'past-perfect-continuous', text: 'We ___ TV for an hour when the power went off.', verb: 'watch', answers: ['had been watching', "'d been watching"], translation: 'Мы час смотрели телевизор, когда отключили свет.', tip: 'Процесс шёл к моменту прошлого — had been + V-ing.',
    },
    {
        id: 'papc-8', tenseId: 'past-perfect-continuous', text: 'He was tired because he ___ all night.', verb: 'drive', answers: ['had been driving', "'d been driving"], translation: 'Он устал, потому что вёл машину всю ночь.', tip: 'Причина усталости — длительный процесс до того.',
    },
    {
        id: 'papc-9', tenseId: 'past-perfect-continuous', text: 'They ___ long when the bus finally came.', verb: 'not/wait', answers: ["hadn't been waiting", 'had not been waiting'], translation: 'Они ждали недолго, когда автобус наконец пришёл.', tip: 'Отрицание: hadn\'t been + V-ing.',
    },
    // Future Perfect Continuous
    {
        id: 'fpc-1', tenseId: 'future-perfect-continuous', text: 'By June I ___ here for ten years.', verb: 'work', answers: ['will have been working', "'ll have been working"], translation: 'К июню я буду работать здесь уже десять лет.', tip: 'Длительность к моменту будущего: will have been + V-ing.',
    },
    {
        id: 'fpc-2', tenseId: 'future-perfect-continuous', text: 'By 2030 she ___ for twenty years.', verb: 'teach', answers: ['will have been teaching', "'ll have been teaching"], translation: 'К 2030 году она будет преподавать уже двадцать лет.', tip: 'by + for — Future Perfect Continuous.',
    },
    {
        id: 'fpc-3', tenseId: 'future-perfect-continuous', text: 'Next month we ___ here for a year.', verb: 'live', answers: ['will have been living', "'ll have been living"], translation: 'В следующем месяце будет год, как мы здесь живём.', tip: '«Будет год, как…» — will have been + V-ing.',
    },
    {
        id: 'fpc-4', tenseId: 'future-perfect-continuous', text: 'By evening he ___ for twelve hours.', verb: 'drive', answers: ['will have been driving', "'ll have been driving"], translation: 'К вечеру он будет за рулём уже двенадцать часов.', tip: 'К вечеру процесс продлится 12 часов — will have been + V-ing.',
    },
    {
        id: 'fpc-5', tenseId: 'future-perfect-continuous', text: 'By 5 pm I ___ for six hours.', verb: 'work', answers: ['will have been working', "'ll have been working"], translation: 'К пяти вечера я буду работать уже шесть часов.', tip: 'will have been + V-ing — «как долго» к сроку.',
    },
    {
        id: 'fpc-6', tenseId: 'future-perfect-continuous', text: 'Next year they ___ together for a decade.', verb: 'play', answers: ['will have been playing', "'ll have been playing"], translation: 'В следующем году будет десять лет, как они играют вместе.', tip: 'Юбилей длительности — will have been + V-ing.',
    },
    {
        id: 'fpc-7', tenseId: 'future-perfect-continuous', text: 'By midnight she ___ for ten hours.', verb: 'study', answers: ['will have been studying', "'ll have been studying"], translation: 'К полуночи она будет заниматься уже десять часов.', tip: 'Длительность к будущему моменту.',
    },
    {
        id: 'fpc-8', tenseId: 'future-perfect-continuous', text: 'By the time you come, I ___ for an hour.', verb: 'cook', answers: ['will have been cooking', "'ll have been cooking"], translation: 'К твоему приходу я буду готовить уже час.', tip: 'by the time + for — Future Perfect Continuous.',
    },
    {
        id: 'fpc-9', tenseId: 'future-perfect-continuous', text: 'In May he ___ here for 20 years.', verb: 'teach', answers: ['will have been teaching', "'ll have been teaching"], translation: 'В мае будет двадцать лет, как он здесь преподаёт.', tip: 'Длительность к дате — will have been + V-ing.',
    },
];
