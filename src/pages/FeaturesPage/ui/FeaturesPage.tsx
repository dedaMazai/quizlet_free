import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Card, Typography } from 'antd';
import {
    AppstoreOutlined,
    BuildOutlined,
    BulbOutlined,
    CloudDownloadOutlined,
    CopyOutlined,
    EditOutlined,
    FileExcelOutlined,
    FormOutlined,
    HistoryOutlined,
    KeyOutlined,
    ReadOutlined,
    RobotOutlined,
    SearchOutlined,
    SettingOutlined,
    SoundOutlined,
    StarOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    TranslationOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { RoutePath } from '@/shared/config/router/routePath';
import { FeatureCard } from '@/shared/ui/FeatureCard';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';

import cls from './FeaturesPage.module.scss';

const { Title } = Typography;

interface Item {
    key: string;
    icon: ReactNode;
    title: string;
    description: string;
}

const FeaturesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const library: Item[] = [
        {
            key: 'decks',
            icon: <AppstoreOutlined />,
            title: t('Колоды'),
            description: t('Создание, редактирование, дублирование и удаление колод.'),
        },
        {
            key: 'cards',
            icon: <UnorderedListOutlined />,
            title: t('Карточки'),
            description: t('Слово, перевод, пример употребления и тип карточки — слово или фраза. Фраза связывается с исходным словом.'),
        },
        {
            key: 'bulk',
            icon: <ThunderboltOutlined />,
            title: t('Массовый ввод'),
            description: t('Редактор на много строк с автопереводом и озвучкой прямо в строке — колода наполняется за один заход.'),
        },
        {
            key: 'import',
            icon: <FileExcelOutlined />,
            title: t('Импорт из Excel'),
            description: t('Шаблон .xlsx скачивается из приложения: слово, перевод и пример читаются по колонкам.'),
        },
        {
            key: 'export',
            icon: <CloudDownloadOutlined />,
            title: t('Экспорт'),
            description: t('Слова выгружаются в Excel, JSON или Markdown — данные всегда можно забрать с собой.'),
        },
        {
            key: 'duplicates',
            icon: <CopyOutlined />,
            title: t('Поиск дублей'),
            description: t('Одинаковые слова внутри колоды группируются, их можно массово отредактировать или удалить.'),
        },
        {
            key: 'favorites',
            icon: <StarOutlined />,
            title: t('Избранное'),
            description: t('Слово отмечается звёздочкой, а избранное учится как отдельная колода — целиком или в рамках одной колоды.'),
        },
        {
            key: 'search',
            icon: <SearchOutlined />,
            title: t('Все слова и поиск'),
            description: t('Сквозной список по всем колодам с поиском по слову, переводу и примеру, плюс глобальный поиск по колодам и словам на главной.'),
        },
    ];

    const modes: Item[] = [
        {
            key: 'flashcards',
            icon: <ReadOutlined />,
            title: t('Карточки'),
            description: t('Переворот карточки, навигация стрелками, перемешивание и озвучка. Режим ознакомительный — в прогресс он ничего не записывает.'),
        },
        {
            key: 'learn',
            icon: <BulbOutlined />,
            title: t('Заучивание'),
            description: t('Раунды по 7 слов: сначала выбор из 4 вариантов, затем ввод с клавиатуры. В каждый раунд подмешиваются новые слова.'),
        },
        {
            key: 'write',
            icon: <FormOutlined />,
            title: t('Письмо'),
            description: t('Ввод перевода в выбранную сторону — с русского на английский или наоборот, с настраиваемым допуском одной опечатки.'),
        },
        {
            key: 'cloze',
            icon: <EditOutlined />,
            title: t('Пропуски'),
            description: t('Слово скрыто внутри собственного примера, включая словоформы, — его нужно вставить по смыслу.'),
        },
        {
            key: 'order',
            icon: <BuildOutlined />,
            title: t('Собери фразу'),
            description: t('Слова фразы перемешаны и собираются кликами. Режим работает с карточками-фразами.'),
        },
        {
            key: 'review',
            icon: <HistoryOutlined />,
            title: t('К повторению'),
            description: t('Сквозная очередь просроченных карточек по всем колодам, с бейджем в меню и карточкой на главной.'),
        },
    ];

    const srs = [
        t('Алгоритм SM-2 lite: интервал растёт с одного дня до трёх, а дальше умножается на фактор лёгкости в диапазоне 1,3–2,8.'),
        t('Кнопок самооценки нет — оценка выводится из самого ответа: верно, опечатка или ошибка.'),
        t('Прогресс хранится на карточку, а не на список: слово, выученное во «Всех словах», считается выученным и внутри своей колоды.'),
        t('Ошибка на выученной карточке возвращает её в очередь текущей сессии, а не откладывает до завтра.'),
    ];

    const progress = [
        t('Точность, число ответов и время изучения.'),
        t('Текущая и рекордная серия дней подряд.'),
        t('Тепловая карта активности за год.'),
        t('Освоение слов: новые, изучаю, усвоено — и процент освоенности каждой колоды.'),
    ];

    const rest: Item[] = [
        {
            key: 'keyboard',
            icon: <KeyOutlined />,
            title: t('Управление с клавиатуры'),
            description: t('На шаге выбора из 4 вариантов первый вариант выбран сразу: стрелки двигают выбор, Enter отвечает выбранным, цифры 1–4 — сразу нужным. Номер показан на кнопке, мышь работает как обычно.'),
        },
        {
            key: 'ai-check',
            icon: <TranslationOutlined />,
            title: t('Проверка переводов ИИ'),
            description: t('ИИ оценивает корректность перевода, предлагает лучший вариант и придумывает пример употребления. Правки применяются выборочно.'),
        },
        {
            key: 'ai-chunks',
            icon: <RobotOutlined />,
            title: t('Подбор фраз ИИ'),
            description: t('К выбранным словам подбираются 2–3 частотные коллокации с переводом и примером и сохраняются как карточки-фразы. Число запросов ограничено лимитом на пользователя.'),
        },
        {
            key: 'share',
            icon: <TeamOutlined />,
            title: t('Совместная работа'),
            description: t('Колодой можно поделиться по email, разрешив или запретив гостям править слова. Гость видит автора и может скопировать колоду себе, а прогресс у каждого свой.'),
        },
        {
            key: 'speech',
            icon: <SoundOutlined />,
            title: t('Озвучка'),
            description: t('Слова и примеры озвучиваются в любом режиме средствами браузера, без внешних сервисов. Голос выбирается в настройках с предпрослушиванием.'),
        },
        {
            key: 'account',
            icon: <SettingOutlined />,
            title: t('Аккаунт и оформление'),
            description: t('Регистрация по email, профиль с аватаром, светлая и тёмная темы, интерфейс на русском и английском.'),
        },
    ];

    const renderGrid = (items: Item[]) => (
        <div className={cls.grid}>
            {items.map((item) => (
                <FeatureCard
                    key={item.key}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                />
            ))}
        </div>
    );

    return (
        <VStack max gap="64" className={cls.FeaturesPage}>
            <VStack max gap="16" align="center" className={cls.header}>
                <Title level={1} className={cls.pageTitle}>
                    {t('Возможности')}
                </Title>
                <MyTypography.Large type="secondary" className={cls.subtitle}>
                    {t('Всё, что уже работает в приложении: от наполнения колод до расписания повторений.')}
                </MyTypography.Large>
            </VStack>

            <VStack max gap="24">
                <Title level={2} className={cls.sectionTitle}>{t('Библиотека')}</Title>
                {renderGrid(library)}
            </VStack>

            <VStack max gap="24">
                <Title level={2} className={cls.sectionTitle}>{t('Режимы занятий')}</Title>
                {renderGrid(modes)}
                <MyTypography.Base type="secondary">
                    {t('Все режимы, кроме «Карточек», записывают результат в общее состояние повторения и в журнал статистики.')}
                </MyTypography.Base>
            </VStack>

            <VStack max gap="24">
                <Title level={2} className={cls.sectionTitle}>{t('Интервальные повторения')}</Title>
                <Card variant="borderless" className={cls.listCard}>
                    <ul className={cls.list}>
                        {srs.map((line) => (
                            <li key={line}>{line}</li>
                        ))}
                    </ul>
                </Card>
            </VStack>

            <VStack max gap="24">
                <Title level={2} className={cls.sectionTitle}>{t('Прогресс')}</Title>
                <Card variant="borderless" className={cls.listCard}>
                    <ul className={cls.list}>
                        {progress.map((line) => (
                            <li key={line}>{line}</li>
                        ))}
                    </ul>
                </Card>
            </VStack>

            <VStack max gap="24">
                <Title level={2} className={cls.sectionTitle}>{t('Помощь и удобство')}</Title>
                {renderGrid(rest)}
            </VStack>

            <HStack max gap="12" wrap justify="center">
                <Button type="primary" size="large" onClick={() => navigate(RoutePath.LOGIN())}>
                    {t('Начать бесплатно')}
                </Button>
                <Button size="large" onClick={() => navigate(RoutePath.FAQ())}>
                    {t('Вопросы и ответы')}
                </Button>
            </HStack>
        </VStack>
    );
};

export default FeaturesPage;
