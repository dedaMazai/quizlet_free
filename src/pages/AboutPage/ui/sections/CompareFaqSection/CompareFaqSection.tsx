import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { AboutAnchor } from '@/shared/config/router/routePath';
import { IRREGULAR_VERBS } from '@/shared/const/grammar';

import { LandingSection, LandingSectionTone } from '../../LandingSection';
import cls from './CompareFaqSection.module.scss';

const ICON_STROKE = 1.5;
const FAQ_ICON_SIZE = 16;

/** Названия продуктов не переводятся. */
const ANKI = 'ANKI';
const QUIZLET = 'QUIZLET';
const ZUBRIKA = 'ZUBRIKA';

/** Сравнение с Anki и Quizlet и частые вопросы */
export const CompareFaqSection = memo(() => {
    const { t } = useTranslation();
    const [openFaq, setOpenFaq] = useState<string | null>('price');

    const compareRows = [
        {
            key: 'srs', criterion: t('Интервальные повторения'), anki: t('да'), quizlet: t('нет'), app: t('да'),
        },
        {
            key: 'context', criterion: t('Слово в контексте'), anki: t('вручную'), quizlet: t('нет'), app: t('отдельный режим'),
        },
        {
            key: 'chunks', criterion: t('Чанки и коллокации'), anki: t('вручную'), quizlet: t('нет'), app: t('с ИИ'),
        },
        {
            key: 'ai-check', criterion: t('Проверка переводов'), anki: t('нет'), quizlet: t('нет'), app: t('с ИИ'),
        },
        {
            key: 'grammar', criterion: t('Грамматика и путь к B1'), anki: t('нет'), quizlet: t('нет'), app: t('да'),
        },
        {
            key: 'entry', criterion: t('Порог входа'), anki: t('высокий'), quizlet: t('низкий'), app: t('низкий'),
        },
        {
            key: 'price', criterion: t('Цена'), anki: t('бесплатно, iOS — платно'), quizlet: t('подписка'), app: t('бесплатно'),
        },
    ];

    const questions = [
        {
            key: 'price',
            label: t('Это бесплатно?'),
            answer: t('Да. Регистрация по email, все режимы занятий и статистика доступны сразу. Ограничен только объём запросов к ИИ — на каждого пользователя действует лимит.'),
        },
        {
            key: 'ai-quota',
            label: t('Сколько запросов к ИИ доступно?'),
            answer: t('У каждого аккаунта дневной лимит. Остаток виден в профиле и рядом с ИИ-кнопками.'),
        },
        {
            key: 'import',
            label: t('Можно ли загрузить свои слова?'),
            answer: t('Да, двумя способами: массовым вводом в редакторе на много строк с автопереводом или импортом файла Excel по шаблону, который скачивается из приложения.'),
        },
        {
            key: 'srs',
            label: t('Как работает расписание повторений?'),
            answer: t('Каждая карточка получает дату следующего показа. Интервал растёт с одного дня до трёх, а дальше умножается на фактор лёгкости. Просроченные карточки собираются в общую очередь «К повторению» по всем колодам.'),
        },
        {
            key: 'self-grade',
            label: t('Нужно ли самому оценивать, насколько хорошо я вспомнил?'),
            answer: t('Нет. Кнопок самооценки нет: оценка выводится из самого ответа — верный ответ, опечатка и ошибка влияют на следующий интервал по-разному.'),
        },
        {
            key: 'chunks',
            label: t('Что такое чанки и зачем учить фразами?'),
            answer: t('Чанки — устойчивые сочетания: коллокации и фразовые глаголы. Готовая фраза снимает нагрузку на её порождение с нуля, поэтому беглость растёт быстрее, чем от списков отдельных слов.'),
        },
        {
            key: 'cycles',
            label: t('Чем циклы заучивания отличаются от колод?'),
            answer: t('Колода с интервальными повторениями сама решает, что показать. Цикл — последовательный формат: слова идут по порядку, каждый день открывается новая порция, а всё пройденное повторяется целиком в обе стороны.'),
        },
        {
            key: 'grammar',
            label: t('Есть ли грамматика?'),
            answer: t('Да: 12 времён в виде матрицы 4 × 3, 7 тем с правилами и типичными ошибками, практика времён с мгновенной проверкой или с ИИ, неправильные глаголы и дорожная карта до уровня B1.'),
        },
        {
            key: 'together',
            label: t('Можно учить вместе с кем-то?'),
            answer: t('Колодой можно поделиться по email. Владелец решает, могут ли гости править слова; гость видит автора и может скопировать колоду себе. Прогресс по общей колоде у каждого свой.'),
        },
        {
            key: 'difference',
            label: t('Чем это отличается от Quizlet и Anki?'),
            answer: t('От Quizlet — расписанием повторений и обучением фразами: слово можно учить внутри предложения, а не списком. От Anki — низким порогом входа: не нужно настраивать шаблоны и плагины, а коллокации подбирает ИИ.'),
        },
        {
            key: 'keyboard',
            label: t('Можно ли заниматься без мыши?'),
            answer: t('Да. На шаге выбора из 4 вариантов первый вариант выбран сразу: стрелки двигают выбор, Enter отвечает выбранным, а цифры 1–4 сразу отвечают нужным. Номер варианта показан на кнопке.'),
        },
        {
            key: 'export',
            label: t('Можно ли забрать свои слова из сервиса?'),
            answer: t('Да. Колода выгружается в Excel, JSON или Markdown. Файл Excel симметричен импорту — его можно загрузить обратно.'),
        },
        {
            key: 'ready-sets',
            label: t('Есть ли готовые наборы слов?'),
            answer: t('Есть набор из {{count}} неправильных глаголов: любая его группа превращается в колоду в один клик. Общего каталога чужих колод нет — есть личные колоды и обмен ими по email. Наполнить колоду быстро помогают массовый ввод, импорт из Excel и ИИ-подбор фраз.', { count: IRREGULAR_VERBS.length }),
        },
    ];

    const toggleFaq = (faqKey: string) => setOpenFaq((prev) => (prev === faqKey ? null : faqKey));

    return (
        <LandingSection
            id={AboutAnchor.COMPARE}
            tone={LandingSectionTone.SURFACE}
            index={9}
            kicker={t('Сравнение и вопросы')}
            title={t('Чем отличается')}
        >
            <div className={cls.columns}>
                <div className={cls.column}>
                    <table className={cls.compare}>
                        <thead>
                            <tr>
                                <th scope="col" className={cls.compareCriterion} aria-label={t('Возможности')} />
                                <th scope="col">{ANKI}</th>
                                <th scope="col">{QUIZLET}</th>
                                <th scope="col" className={cls.compareApp}>{ZUBRIKA}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compareRows.map((row) => (
                                <tr key={row.key}>
                                    <th scope="row" className={cls.compareCriterion}>{row.criterion}</th>
                                    <td>{row.anki}</td>
                                    <td>{row.quizlet}</td>
                                    <td className={cls.compareApp}>{row.app}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div id={AboutAnchor.FAQ} className={cls.column}>
                    <h3 className={cls.faqTitle}>{t('Вопросы')}</h3>
                    <div className={cls.faq}>
                        {questions.map((item) => {
                            const isOpen = openFaq === item.key;
                            const answerId = `faq-${item.key}`;

                            return (
                                <div key={item.key} className={cls.faqItem}>
                                    <button
                                        type="button"
                                        className={cls.faqQuestion}
                                        aria-expanded={isOpen}
                                        aria-controls={isOpen ? answerId : undefined}
                                        onClick={() => toggleFaq(item.key)}
                                    >
                                        <span>{item.label}</span>
                                        <span className={cls.faqIcon}>
                                            {isOpen
                                                ? <X size={FAQ_ICON_SIZE} strokeWidth={ICON_STROKE} />
                                                : <Plus size={FAQ_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                                        </span>
                                    </button>
                                    {isOpen && <p id={answerId} className={cls.faqAnswer}>{item.answer}</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </LandingSection>
    );
});

CompareFaqSection.displayName = 'CompareFaqSection';
