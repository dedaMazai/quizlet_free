export interface IrregularVerb {
    base: string;
    past: string;
    participle: string;
    /** Русский перевод — идёт в карточку как есть. */
    translation: string;
}

/** Размер одной частотной группы (и будущей колоды). */
export const VERB_BAND_SIZE = 35;

/** Глаголы упорядочены по убыванию частотности. */
export const IRREGULAR_VERBS: IrregularVerb[] = [
    { base: 'be', past: 'was/were', participle: 'been', translation: 'быть' },
    { base: 'have', past: 'had', participle: 'had', translation: 'иметь' },
    { base: 'do', past: 'did', participle: 'done', translation: 'делать' },
    { base: 'say', past: 'said', participle: 'said', translation: 'сказать' },
    { base: 'go', past: 'went', participle: 'gone', translation: 'идти' },
    { base: 'get', past: 'got', participle: 'got', translation: 'получать' },
    { base: 'make', past: 'made', participle: 'made', translation: 'делать, создавать' },
    { base: 'know', past: 'knew', participle: 'known', translation: 'знать' },
    { base: 'think', past: 'thought', participle: 'thought', translation: 'думать' },
    { base: 'take', past: 'took', participle: 'taken', translation: 'брать' },
    { base: 'see', past: 'saw', participle: 'seen', translation: 'видеть' },
    { base: 'come', past: 'came', participle: 'come', translation: 'приходить' },
    { base: 'find', past: 'found', participle: 'found', translation: 'находить' },
    { base: 'give', past: 'gave', participle: 'given', translation: 'давать' },
    { base: 'tell', past: 'told', participle: 'told', translation: 'рассказывать' },
    { base: 'become', past: 'became', participle: 'become', translation: 'становиться' },
    { base: 'show', past: 'showed', participle: 'shown', translation: 'показывать' },
    { base: 'leave', past: 'left', participle: 'left', translation: 'уходить, оставлять' },
    { base: 'feel', past: 'felt', participle: 'felt', translation: 'чувствовать' },
    { base: 'put', past: 'put', participle: 'put', translation: 'класть' },
    { base: 'bring', past: 'brought', participle: 'brought', translation: 'приносить' },
    { base: 'begin', past: 'began', participle: 'begun', translation: 'начинать' },
    { base: 'keep', past: 'kept', participle: 'kept', translation: 'хранить, продолжать' },
    { base: 'hold', past: 'held', participle: 'held', translation: 'держать' },
    { base: 'write', past: 'wrote', participle: 'written', translation: 'писать' },
    { base: 'stand', past: 'stood', participle: 'stood', translation: 'стоять' },
    { base: 'hear', past: 'heard', participle: 'heard', translation: 'слышать' },
    { base: 'let', past: 'let', participle: 'let', translation: 'позволять' },
    { base: 'mean', past: 'meant', participle: 'meant', translation: 'значить' },
    { base: 'set', past: 'set', participle: 'set', translation: 'устанавливать' },
    { base: 'meet', past: 'met', participle: 'met', translation: 'встречать' },
    { base: 'run', past: 'ran', participle: 'run', translation: 'бежать' },
    { base: 'pay', past: 'paid', participle: 'paid', translation: 'платить' },
    { base: 'sit', past: 'sat', participle: 'sat', translation: 'сидеть' },
    { base: 'speak', past: 'spoke', participle: 'spoken', translation: 'говорить' },
    { base: 'lie', past: 'lay', participle: 'lain', translation: 'лежать' },
    { base: 'lead', past: 'led', participle: 'led', translation: 'вести' },
    { base: 'read', past: 'read', participle: 'read', translation: 'читать' },
    { base: 'grow', past: 'grew', participle: 'grown', translation: 'расти' },
    { base: 'lose', past: 'lost', participle: 'lost', translation: 'терять' },
    { base: 'fall', past: 'fell', participle: 'fallen', translation: 'падать' },
    { base: 'send', past: 'sent', participle: 'sent', translation: 'отправлять' },
    { base: 'build', past: 'built', participle: 'built', translation: 'строить' },
    { base: 'understand', past: 'understood', participle: 'understood', translation: 'понимать' },
    { base: 'draw', past: 'drew', participle: 'drawn', translation: 'рисовать' },
    { base: 'break', past: 'broke', participle: 'broken', translation: 'ломать' },
    { base: 'spend', past: 'spent', participle: 'spent', translation: 'тратить' },
    { base: 'cut', past: 'cut', participle: 'cut', translation: 'резать' },
    { base: 'rise', past: 'rose', participle: 'risen', translation: 'подниматься' },
    { base: 'drive', past: 'drove', participle: 'driven', translation: 'водить машину' },
    { base: 'buy', past: 'bought', participle: 'bought', translation: 'покупать' },
    { base: 'wear', past: 'wore', participle: 'worn', translation: 'носить одежду' },
    { base: 'choose', past: 'chose', participle: 'chosen', translation: 'выбирать' },
    { base: 'eat', past: 'ate', participle: 'eaten', translation: 'есть' },
    { base: 'drink', past: 'drank', participle: 'drunk', translation: 'пить' },
    { base: 'sleep', past: 'slept', participle: 'slept', translation: 'спать' },
    { base: 'fly', past: 'flew', participle: 'flown', translation: 'летать' },
    { base: 'forget', past: 'forgot', participle: 'forgotten', translation: 'забывать' },
    { base: 'teach', past: 'taught', participle: 'taught', translation: 'обучать' },
    { base: 'catch', past: 'caught', participle: 'caught', translation: 'ловить' },
    { base: 'win', past: 'won', participle: 'won', translation: 'выигрывать' },
    { base: 'sell', past: 'sold', participle: 'sold', translation: 'продавать' },
    { base: 'fight', past: 'fought', participle: 'fought', translation: 'сражаться' },
    { base: 'throw', past: 'threw', participle: 'thrown', translation: 'бросать' },
    { base: 'sing', past: 'sang', participle: 'sung', translation: 'петь' },
    { base: 'swim', past: 'swam', participle: 'swum', translation: 'плавать' },
    { base: 'blow', past: 'blew', participle: 'blown', translation: 'дуть' },
    { base: 'hang', past: 'hung', participle: 'hung', translation: 'висеть, вешать' },
    { base: 'hide', past: 'hid', participle: 'hidden', translation: 'прятать' },
    { base: 'shake', past: 'shook', participle: 'shaken', translation: 'трясти' },
    { base: 'ride', past: 'rode', participle: 'ridden', translation: 'ездить верхом' },
    { base: 'feed', past: 'fed', participle: 'fed', translation: 'кормить' },
    { base: 'wake', past: 'woke', participle: 'woken', translation: 'просыпаться' },
    { base: 'steal', past: 'stole', participle: 'stolen', translation: 'красть' },
    { base: 'hurt', past: 'hurt', participle: 'hurt', translation: 'причинять боль' },
    { base: 'beat', past: 'beat', participle: 'beaten', translation: 'бить' },
    { base: 'bend', past: 'bent', participle: 'bent', translation: 'сгибать' },
    { base: 'bite', past: 'bit', participle: 'bitten', translation: 'кусать' },
    { base: 'burn', past: 'burnt', participle: 'burnt', translation: 'гореть, жечь' },
    { base: 'cost', past: 'cost', participle: 'cost', translation: 'стоить' },
    { base: 'deal', past: 'dealt', participle: 'dealt', translation: 'иметь дело' },
    { base: 'dig', past: 'dug', participle: 'dug', translation: 'копать' },
    { base: 'dream', past: 'dreamt', participle: 'dreamt', translation: 'мечтать, видеть сны' },
    { base: 'forgive', past: 'forgave', participle: 'forgiven', translation: 'прощать' },
    { base: 'freeze', past: 'froze', participle: 'frozen', translation: 'замерзать' },
    { base: 'hit', past: 'hit', participle: 'hit', translation: 'ударять' },
    { base: 'lay', past: 'laid', participle: 'laid', translation: 'класть, выкладывать' },
    { base: 'lend', past: 'lent', participle: 'lent', translation: 'одалживать' },
    { base: 'quit', past: 'quit', participle: 'quit', translation: 'бросать, увольняться' },
    { base: 'shine', past: 'shone', participle: 'shone', translation: 'светить' },
    { base: 'shoot', past: 'shot', participle: 'shot', translation: 'стрелять' },
    { base: 'shut', past: 'shut', participle: 'shut', translation: 'закрывать' },
    { base: 'spread', past: 'spread', participle: 'spread', translation: 'распространять' },
    { base: 'tear', past: 'tore', participle: 'torn', translation: 'рвать' },
    { base: 'sweep', past: 'swept', participle: 'swept', translation: 'подметать' },
    { base: 'stick', past: 'stuck', participle: 'stuck', translation: 'приклеивать, застревать' },
    { base: 'sink', past: 'sank', participle: 'sunk', translation: 'тонуть' },
    { base: 'slide', past: 'slid', participle: 'slid', translation: 'скользить' },
    { base: 'spell', past: 'spelt', participle: 'spelt', translation: 'писать по буквам' },
    { base: 'strike', past: 'struck', participle: 'struck', translation: 'ударять, бастовать' },
    { base: 'swear', past: 'swore', participle: 'sworn', translation: 'клясться, ругаться' },
    { base: 'seek', past: 'sought', participle: 'sought', translation: 'искать' },
    { base: 'shrink', past: 'shrank', participle: 'shrunk', translation: 'уменьшаться' },
    { base: 'arise', past: 'arose', participle: 'arisen', translation: 'возникать' },
    { base: 'bear', past: 'bore', participle: 'borne', translation: 'нести, терпеть' },
];

export interface VerbBand {
    /** Номер группы, с единицы. */
    index: number;
    /** Диапазон «от–до» по частотности (с единицы, включительно). */
    from: number;
    to: number;
    verbs: IrregularVerb[];
}

export const VERB_BANDS: VerbBand[] = Array.from(
    { length: Math.ceil(IRREGULAR_VERBS.length / VERB_BAND_SIZE) },
    (_, i) => ({
        index: i + 1,
        from: i * VERB_BAND_SIZE + 1,
        to: Math.min((i + 1) * VERB_BAND_SIZE, IRREGULAR_VERBS.length),
        verbs: IRREGULAR_VERBS.slice(i * VERB_BAND_SIZE, (i + 1) * VERB_BAND_SIZE),
    }),
);

/** Термин карточки: все три формы через пробел — в режиме письма набираются целиком. */
export const verbToTerm = (verb: IrregularVerb): string => (
    `${verb.base} ${verb.past} ${verb.participle}`
);
