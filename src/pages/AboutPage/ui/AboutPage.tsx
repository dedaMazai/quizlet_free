import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Tag, Typography } from 'antd';
import {
    AimOutlined,
    BuildOutlined,
    BulbOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    EditOutlined,
    FireOutlined,
    FormOutlined,
    HistoryOutlined,
    LineChartOutlined,
    PieChartOutlined,
    ReadOutlined,
    RobotOutlined,
    ThunderboltOutlined,
    TranslationOutlined,
} from '@ant-design/icons';
import { RoutePath } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { FeatureCard } from '@/shared/ui/FeatureCard';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';

import cls from './AboutPage.module.scss';

const { Title } = Typography;

/** Демонстрация режима «Пропуски» — английский текст не переводится. */
const DEMO_SENTENCE_START = 'I want to';
const DEMO_SENTENCE_END = 'with native speakers.';
const DEMO_ANSWER = 'engage in conversation';
const DEMO_OPTIONS = ['take place', 'engage in conversation', 'look forward', 'make sense'];

/** Названия сторонних продуктов не переводятся. */
const ANKI = 'Anki';
const QUIZLET = 'Quizlet';

const AboutPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const goToLogin = () => navigate(RoutePath.LOGIN());

    const reasons = [
        {
            key: 'chunks',
            icon: <ThunderboltOutlined />,
            title: t('Чанки эффективнее отдельных слов'),
            description: t('Устойчивые сочетания — коллокации и фразовые глаголы — развивают беглость сильнее, чем списки слов: готовая фраза снимает нагрузку на её порождение с нуля.'),
        },
        {
            key: 'context',
            icon: <AimOutlined />,
            title: t('Контекст и активное припоминание'),
            description: t('Слово, выученное внутри предложения, удерживается дольше и лучше переносится в живую речь. Формат «пропуск в предложении» даёт припоминание именно в контексте.'),
        },
        {
            key: 'srs',
            icon: <ClockCircleOutlined />,
            title: t('Повторения по расписанию'),
            description: t('Без расписания повторов приложение умеет «выучить сегодня», но не умеет «не забыть через месяц». Здесь расписание — основа, а не украшение.'),
        },
    ];

    const modes = [
        {
            key: 'flashcards',
            icon: <ReadOutlined />,
            title: t('Карточки'),
            description: t('Переворот карточки, стрелки, перемешивание, озвучка — для первого знакомства и узнавания.'),
        },
        {
            key: 'learn',
            icon: <BulbOutlined />,
            title: t('Заучивание'),
            description: t('Раунды по 7 слов: сначала выбор из 4 вариантов, затем ввод с клавиатуры — переход от узнавания к воспроизведению.'),
        },
        {
            key: 'write',
            icon: <FormOutlined />,
            title: t('Письмо'),
            description: t('Ввод перевода в обе стороны, с русского и с английского, с допуском одной опечатки — точность написания.'),
        },
        {
            key: 'cloze',
            icon: <EditOutlined />,
            title: t('Пропуски'),
            description: t('Слово скрыто внутри своего примера — его нужно вставить по смыслу. Самый сильный формат по исследованиям.'),
        },
        {
            key: 'order',
            icon: <BuildOutlined />,
            title: t('Собери фразу'),
            description: t('Слова фразы перемешаны и собираются кликами — порядок слов и беглость на чанках.'),
        },
        {
            key: 'review',
            icon: <HistoryOutlined />,
            title: t('К повторению'),
            description: t('Сквозная очередь просроченных карточек по всем колодам — удержание в долгой памяти.'),
        },
    ];

    const aiFeatures = [
        {
            key: 'check',
            icon: <TranslationOutlined />,
            title: t('Проверка переводов'),
            description: t('ИИ оценивает корректность перевода, предлагает лучший вариант и придумывает пример употребления. Правки видны в таблице и применяются выборочно.'),
        },
        {
            key: 'chunks',
            icon: <RobotOutlined />,
            title: t('Подбор фраз'),
            description: t('К выбранным словам подбираются 2–3 частотные коллокации с переводом и примером. Они сохраняются как карточки-фразы и сразу готовы для «Пропусков» и «Собери фразу».'),
        },
    ];

    const progress = [
        {
            key: 'accuracy',
            icon: <LineChartOutlined />,
            title: t('Точность и время'),
            description: t('Точность ответов, их количество и время, проведённое за занятиями.'),
        },
        {
            key: 'streak',
            icon: <FireOutlined />,
            title: t('Серии дней'),
            description: t('Текущая и рекордная серия дней подряд, а также тепловая карта активности за год.'),
        },
        {
            key: 'mastery',
            icon: <PieChartOutlined />,
            title: t('Освоение слов'),
            description: t('Распределение слов на новые, изучаемые и усвоенные — и процент освоенности каждой колоды.'),
        },
    ];

    const steps = [
        {
            key: 'deck',
            title: t('Создайте колоду'),
            description: t('Название и описание — колода готова.'),
        },
        {
            key: 'words',
            title: t('Добавьте слова'),
            description: t('Вручную, массовым вводом с автопереводом или импортом из Excel.'),
        },
        {
            key: 'learn',
            title: t('Занимайтесь и повторяйте'),
            description: t('Выберите режим — расписание повторов приложение составит само.'),
        },
    ];

    const compareRows = [
        {
            key: 'srs',
            criterion: t('Интервальные повторения'),
            anki: t('да'),
            quizlet: t('нет'),
            app: t('да'),
        },
        {
            key: 'context',
            criterion: t('Слово в контексте предложения'),
            anki: t('вручную'),
            quizlet: t('нет'),
            app: t('да, отдельный режим'),
        },
        {
            key: 'chunks',
            criterion: t('Обучение чанками (коллокациями)'),
            anki: t('вручную'),
            quizlet: t('нет'),
            app: t('да, с ИИ-подбором'),
        },
        {
            key: 'entry',
            criterion: t('Порог входа'),
            anki: t('высокий'),
            quizlet: t('низкий'),
            app: t('низкий'),
        },
        {
            key: 'sets',
            criterion: t('Готовые наборы'),
            anki: t('нет'),
            quizlet: t('900 млн'),
            app: t('нет — личные колоды и обмен'),
        },
    ];

    return (
        <VStack max gap="64" className={cls.AboutPage}>
            <section className={cls.hero}>
                <VStack gap="20" align="start" className={cls.heroText}>
                    <Tag className={cls.badge} variant="filled">
                        {t('Бесплатно, без установки')}
                    </Tag>
                    <Title level={1} className={cls.heroTitle}>
                        {t('Учите английский фразами — и не забывайте выученное')}
                    </Title>
                    <MyTypography.Large type="secondary" className={cls.heroSubtitle}>
                        {t('Гибкость колод как у Quizlet, память как у Anki, плюс контекст и ИИ, которых нет ни у одного из них.')}
                    </MyTypography.Large>
                    <HStack gap="12" wrap>
                        <Button type="primary" size="large" onClick={goToLogin}>
                            {t('Начать бесплатно')}
                        </Button>
                        <Button size="large" onClick={() => navigate(RoutePath.FEATURES())}>
                            {t('Все возможности')}
                        </Button>
                    </HStack>
                </VStack>

                <div className={cls.demo} aria-hidden="true">
                    <MyTypography.Small type="secondary">
                        {t('Так выглядит режим «Пропуски»')}
                    </MyTypography.Small>
                    <p className={cls.demoSentence}>
                        {DEMO_SENTENCE_START}
                        <span className={cls.demoBlank} />
                        {DEMO_SENTENCE_END}
                    </p>
                    <div className={cls.demoOptions}>
                        {DEMO_OPTIONS.map((option, index) => (
                            <span
                                key={option}
                                className={classNames(cls.demoOption, {
                                    [cls.demoOptionCorrect]: option === DEMO_ANSWER,
                                })}
                            >
                                <span className={cls.demoOptionIndex}>{index + 1}</span>
                                {option}
                                {option === DEMO_ANSWER && <CheckOutlined className={cls.demoOptionCheck} />}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className={cls.section}>
                <Title level={2} className={cls.sectionTitle}>
                    {t('На чём основаны решения')}
                </Title>
                <div className={cls.grid}>
                    {reasons.map((item) => (
                        <FeatureCard
                            key={item.key}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </div>
            </section>

            <section className={cls.section}>
                <Title level={2} className={cls.sectionTitle}>
                    {t('Зачем это, если есть Quizlet и Anki')}
                </Title>
                <div className={cls.compareWrapper}>
                    <table className={cls.compare}>
                        <thead>
                            <tr>
                                <th scope="col" className={cls.compareCriterion}>{t('Возможности')}</th>
                                <th scope="col">{ANKI}</th>
                                <th scope="col">{QUIZLET}</th>
                                <th scope="col" className={cls.compareApp}>{t('Zubrika')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compareRows.map((row) => (
                                <tr key={row.key}>
                                    <th scope="row" className={cls.compareCriterion}>{row.criterion}</th>
                                    <td data-label={ANKI}>{row.anki}</td>
                                    <td data-label={QUIZLET}>{row.quizlet}</td>
                                    <td className={cls.compareApp} data-label={t('Zubrika')}>
                                        {row.app}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className={cls.section}>
                <Title level={2} className={cls.sectionTitle}>
                    {t('Режимы занятий')}
                </Title>
                <div className={cls.grid}>
                    {modes.map((item) => (
                        <FeatureCard
                            key={item.key}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </div>
                <MyTypography.Base type="secondary" className={cls.note}>
                    {t('Занятие проходится целиком с клавиатуры: стрелки двигают выбор, цифры 1–4 отвечают сразу, Enter подтверждает.')}
                </MyTypography.Base>
            </section>

            <section className={cls.section}>
                <Title level={2} className={cls.sectionTitle}>
                    {t('ИИ помогает наполнять колоды')}
                </Title>
                <div className={cls.grid}>
                    {aiFeatures.map((item) => (
                        <FeatureCard
                            key={item.key}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </div>
            </section>

            <section className={cls.section}>
                <Title level={2} className={cls.sectionTitle}>
                    {t('Видно, как идёт прогресс')}
                </Title>
                <div className={cls.grid}>
                    {progress.map((item) => (
                        <FeatureCard
                            key={item.key}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </div>
            </section>

            <section className={cls.section}>
                <Title level={2} className={cls.sectionTitle}>
                    {t('Как начать')}
                </Title>
                <ol className={cls.steps}>
                    {steps.map((step, index) => (
                        <li key={step.key} className={cls.step}>
                            <span className={cls.stepIndex}>{index + 1}</span>
                            <VStack gap="4">
                                <MyTypography.Large strong>{step.title}</MyTypography.Large>
                                <MyTypography.Small type="secondary">{step.description}</MyTypography.Small>
                            </VStack>
                        </li>
                    ))}
                </ol>
            </section>

            <section className={classNames(cls.section, {}, [cls.cta])}>
                <Title level={2} className={cls.sectionTitle}>
                    {t('Начните с первой колоды')}
                </Title>
                <MyTypography.Base type="secondary" className={cls.note}>
                    {t('Регистрация по email занимает минуту, все функции доступны сразу.')}
                </MyTypography.Base>
                <HStack gap="12" wrap justify="center">
                    <Button type="primary" size="large" onClick={goToLogin}>
                        {t('Создать аккаунт')}
                    </Button>
                    <Button size="large" onClick={() => navigate(RoutePath.FAQ())}>
                        {t('Вопросы и ответы')}
                    </Button>
                </HStack>
            </section>
        </VStack>
    );
};

export default AboutPage;
