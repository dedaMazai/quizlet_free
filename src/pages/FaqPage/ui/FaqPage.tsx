import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Collapse, Typography } from 'antd';
import { RoutePath } from '@/shared/config/router/routePath';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';

import cls from './FaqPage.module.scss';

const { Title, Paragraph } = Typography;

const FaqPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const questions = [
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
            key: 'srs',
            label: t('Как работают интервальные повторения?'),
            answer: t('Каждая карточка получает дату следующего показа. Интервал растёт с одного дня до трёх, а дальше умножается на фактор лёгкости. Просроченные карточки собираются в общую очередь «К повторению» по всем колодам.'),
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
            key: 'import',
            label: t('Можно ли загрузить свои слова?'),
            answer: t('Да, двумя способами: массовым вводом в редакторе на много строк с автопереводом или импортом файла Excel по шаблону, который скачивается из приложения.'),
        },
        {
            key: 'export',
            label: t('Можно ли забрать свои слова из сервиса?'),
            answer: t('Да. Колода выгружается в Excel, JSON или Markdown. Файл Excel симметричен импорту — его можно загрузить обратно.'),
        },
        {
            key: 'ai',
            label: t('Как работает ИИ и есть ли ограничения?'),
            answer: t('ИИ проверяет переводы, придумывает примеры употребления и подбирает частотные коллокации к выбранным словам. Число запросов ограничено лимитом на пользователя, а результат всегда показывается на подтверждение — правки применяются выборочно.'),
        },
        {
            key: 'together',
            label: t('Можно ли учиться вместе с другими?'),
            answer: t('Колодой можно поделиться по email. Владелец решает, могут ли гости править слова; гость видит автора и может скопировать колоду себе. Прогресс по общей колоде у каждого свой.'),
        },
        {
            key: 'ready-sets',
            label: t('Есть ли готовые наборы слов?'),
            answer: t('Нет. Общего каталога чужих колод в приложении нет — есть личные колоды и обмен ими по email. Наполнить колоду быстро помогают массовый ввод, импорт из Excel и ИИ-подбор фраз.'),
        },
    ];

    return (
        <VStack max gap="32" className={cls.FaqPage}>
            <VStack max gap="16" align="center" className={cls.header}>
                <Title level={1} className={cls.pageTitle}>
                    {t('Вопросы и ответы')}
                </Title>
                <MyTypography.Large type="secondary" className={cls.subtitle}>
                    {t('Коротко о том, как устроено приложение и чего от него ждать.')}
                </MyTypography.Large>
            </VStack>

            <Collapse
                accordion
                className={cls.collapse}
                items={questions.map((item) => ({
                    key: item.key,
                    label: item.label,
                    children: <Paragraph className={cls.answer}>{item.answer}</Paragraph>,
                }))}
            />

            <HStack max gap="12" wrap justify="center">
                <Button type="primary" size="large" onClick={() => navigate(RoutePath.LOGIN())}>
                    {t('Начать бесплатно')}
                </Button>
                <Button size="large" onClick={() => navigate(RoutePath.FEATURES())}>
                    {t('Все возможности')}
                </Button>
            </HStack>
        </VStack>
    );
};

export default FaqPage;
