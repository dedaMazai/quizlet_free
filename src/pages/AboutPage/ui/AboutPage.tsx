import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Button } from 'antd';
import {
    History, Layers, LayoutGrid, Lightbulb, PenLine, Plus, Sparkles, X,
} from 'lucide-react';
import { useUserInfo } from '@/entities/User';
import { AboutAnchor, RoutePath } from '@/shared/config/router/routePath';
import { BlueprintMarks } from '@/shared/ui/Blueprint';

import cls from './AboutPage.module.scss';

const ICON_STROKE = 1.5;
const FEATURE_ICON_SIZE = 22;
const FAQ_ICON_SIZE = 16;

/** Названия продуктов не переводятся. */
const ANKI = 'ANKI';
const QUIZLET = 'QUIZLET';
const ZUBRIKA = 'ZUBRIKA';

interface Feature {
    key: string;
    icon: ReactNode;
    title: string;
    description: string;
}

const featureIcon = (Icon: typeof LayoutGrid) => <Icon size={FEATURE_ICON_SIZE} strokeWidth={ICON_STROKE} />;

const formatIndex = (index: number) => String(index + 1).padStart(2, '0');

/** «О сервисе» + бывшие «Возможности» и «Вопросы» одной страницей (Public 6.34) */
const AboutPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { hash, key } = useLocation();
    const userInfo = useUserInfo();
    const [openFaq, setOpenFaq] = useState<string | null>('ai-quota');

    // Якоря из шапки и редиректы со старых /features и /faq
    useEffect(() => {
        if (hash) {
            document.getElementById(hash.slice(1))?.scrollIntoView();
        }
    }, [hash, key]);

    const handleStart = () => navigate(userInfo ? RoutePath.MAIN() : RoutePath.LOGIN());

    const features: Feature[] = [
        {
            key: 'flashcards',
            icon: featureIcon(LayoutGrid),
            title: t('Карточки'),
            description: t('Первое знакомство: переворот, озвучка, перемешивание.'),
        },
        {
            key: 'learn',
            icon: featureIcon(Lightbulb),
            title: t('Заучивание'),
            description: t('Раунды по 7 слов: сначала выбор из 4, затем ввод с клавиатуры.'),
        },
        {
            key: 'write',
            icon: featureIcon(PenLine),
            title: t('Письмо'),
            description: t('Перевод в обе стороны, одна опечатка допускается.'),
        },
        {
            key: 'cloze',
            icon: featureIcon(Sparkles),
            title: t('Пропуски'),
            description: t('Слово скрыто в своём примере — самый сильный формат для памяти.'),
        },
        {
            key: 'order',
            icon: featureIcon(Layers),
            title: t('Собери фразу'),
            description: t('Порядок слов на чанках — для беглой речи.'),
        },
        {
            key: 'review',
            icon: featureIcon(History),
            title: t('К повторению'),
            description: t('Единая очередь просроченных карточек из всех колод.'),
        },
    ];

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
            key: 'entry', criterion: t('Порог входа'), anki: t('высокий'), quizlet: t('низкий'), app: t('низкий'),
        },
    ];

    const questions = [
        {
            key: 'ai-quota',
            label: t('Сколько запросов к ИИ доступно?'),
            answer: t('У каждого аккаунта месячный лимит. Остаток виден в профиле и рядом с ИИ-кнопками.'),
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
            key: 'together',
            label: t('Можно учить вместе с кем-то?'),
            answer: t('Колодой можно поделиться по email. Владелец решает, могут ли гости править слова; гость видит автора и может скопировать колоду себе. Прогресс по общей колоде у каждого свой.'),
        },
        {
            key: 'ai',
            label: t('Как работает ИИ и есть ли ограничения?'),
            answer: t('ИИ проверяет переводы, придумывает примеры употребления и подбирает частотные коллокации к выбранным словам. Число запросов ограничено лимитом на пользователя, а результат всегда показывается на подтверждение — правки применяются выборочно.'),
        },
        {
            key: 'difference',
            label: t('Чем это отличается от Quizlet и Anki?'),
            answer: t('От Quizlet — расписанием повторений и обучением фразами: слово можно учить внутри предложения, а не списком. От Anki — низким порогом входа: не нужно настраивать шаблоны и плагины, а коллокации подбирает ИИ.'),
        },
        {
            key: 'price',
            label: t('Это бесплатно?'),
            answer: t('Да. Регистрация по email, все режимы занятий и статистика доступны сразу. Ограничен только объём запросов к ИИ — на каждого пользователя действует лимит.'),
        },
        {
            key: 'chunks',
            label: t('Что такое чанки и зачем учить фразами?'),
            answer: t('Чанки — устойчивые сочетания: коллокации и фразовые глаголы. Готовая фраза снимает нагрузку на её порождение с нуля, поэтому беглость растёт быстрее, чем от списков отдельных слов.'),
        },
        {
            key: 'self-grade',
            label: t('Нужно ли самому оценивать, насколько хорошо я вспомнил?'),
            answer: t('Нет. Кнопок самооценки нет: оценка выводится из самого ответа — верный ответ, опечатка и ошибка влияют на следующий интервал по-разному.'),
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
            answer: t('Нет. Общего каталога чужих колод в приложении нет — есть личные колоды и обмен ими по email. Наполнить колоду быстро помогают массовый ввод, импорт из Excel и ИИ-подбор фраз.'),
        },
    ];

    const toggleFaq = (faqKey: string) => setOpenFaq((prev) => (prev === faqKey ? null : faqKey));

    return (
        <div className={cls.AboutPage}>
            <section className={cls.hero}>
                <div className={cls.heroMain}>
                    <span className={cls.heroKicker}>{t('ГИБКОСТЬ QUIZLET · ПАМЯТЬ ANKI · КОНТЕКСТ И ИИ')}</span>
                    <h1 className={cls.heroTitle}>{t('Учите фразами. Не забывайте через месяц.')}</h1>
                </div>
                <div className={cls.heroAside}>
                    <p className={cls.heroText}>
                        {t('Колоды слов и фраз, шесть режимов занятий и расписание повторений, которое само решает, что показать сегодня.')}
                    </p>
                    <div>
                        <Button type="primary" className={cls.heroCta} onClick={handleStart}>
                            <BlueprintMarks />
                            {t('Создать первую колоду')}
                        </Button>
                    </div>
                </div>
            </section>

            <section id={AboutAnchor.FEATURES} className={cls.features}>
                {features.map((item, index) => (
                    <div key={item.key} className={cls.feature}>
                        <div className={cls.featureHead}>
                            <span className={cls.featureIndex}>{formatIndex(index)}</span>
                            <span className={cls.featureIcon}>{item.icon}</span>
                        </div>
                        <span className={cls.featureTitle}>{item.title}</span>
                        <span className={cls.featureText}>{item.description}</span>
                    </div>
                ))}
            </section>

            <div className={cls.columns}>
                <section id={AboutAnchor.COMPARE} className={cls.column}>
                    <h2 className={cls.sectionTitle}>{t('Чем отличается')}</h2>
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
                </section>

                <section id={AboutAnchor.FAQ} className={cls.column}>
                    <h2 className={cls.sectionTitle}>{t('Вопросы')}</h2>
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
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
