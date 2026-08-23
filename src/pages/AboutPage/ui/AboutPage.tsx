import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    AimOutlined,
    BuildOutlined,
    BulbOutlined,
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
import { FeatureCard } from '@/shared/ui/FeatureCard';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';

import cls from './AboutPage.module.scss';

const { Title } = Typography;

interface CompareRow {
    key: string;
    criterion: string;
    anki: string;
    quizlet: string;
    app: string;
}

const AboutPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

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

    const compareColumns: ColumnsType<CompareRow> = [
        {
            title: '',
            dataIndex: 'criterion',
            key: 'criterion',
            width: 260,
        },
        {
            title: 'Anki',
            dataIndex: 'anki',
            key: 'anki',
        },
        {
            title: 'Quizlet',
            dataIndex: 'quizlet',
            key: 'quizlet',
        },
        {
            title: t('Это приложение'),
            dataIndex: 'app',
            key: 'app',
            render: (value: string) => <Tag color="processing">{value}</Tag>,
        },
    ];

    const compareData: CompareRow[] = [
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
            <VStack max gap="24" align="center" className={cls.hero}>
                <Title level={1} className={cls.heroTitle}>
                    {t('Учите английский фразами — и не забывайте выученное')}
                </Title>
                <MyTypography.Large type="secondary" className={cls.heroSubtitle}>
                    {t('Гибкость колод как у Quizlet, память как у Anki, плюс контекст и ИИ, которых нет ни у одного из них.')}
                </MyTypography.Large>
                <HStack gap="12" wrap justify="center">
                    <Button type="primary" size="large" onClick={() => navigate(RoutePath.LOGIN())}>
                        {t('Начать бесплатно')}
                    </Button>
                    <Button size="large" onClick={() => navigate(RoutePath.FEATURES())}>
                        {t('Все возможности')}
                    </Button>
                </HStack>
            </VStack>

            <VStack max gap="24">
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
            </VStack>

            <VStack max gap="24">
                <Title level={2} className={cls.sectionTitle}>
                    {t('Зачем это, если есть Quizlet и Anki')}
                </Title>
                <Table<CompareRow>
                    columns={compareColumns}
                    dataSource={compareData}
                    pagination={false}
                    size="middle"
                    scroll={{ x: 720 }}
                />
            </VStack>

            <VStack max gap="24">
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
                <MyTypography.Base type="secondary">
                    {t('Занятие проходится целиком с клавиатуры: стрелки двигают выбор, цифры 1–4 отвечают сразу, Enter подтверждает.')}
                </MyTypography.Base>
            </VStack>

            <VStack max gap="24">
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
            </VStack>

            <VStack max gap="24">
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
            </VStack>

            <VStack max gap="16" align="center" className={cls.cta}>
                <Title level={2} className={cls.sectionTitle}>
                    {t('Начните с первой колоды')}
                </Title>
                <MyTypography.Base type="secondary">
                    {t('Регистрация по email занимает минуту, все функции доступны сразу.')}
                </MyTypography.Base>
                <HStack gap="12" wrap justify="center">
                    <Button type="primary" size="large" onClick={() => navigate(RoutePath.LOGIN())}>
                        {t('Создать аккаунт')}
                    </Button>
                    <Button size="large" onClick={() => navigate(RoutePath.FAQ())}>
                        {t('Вопросы и ответы')}
                    </Button>
                </HStack>
            </VStack>
        </VStack>
    );
};

export default AboutPage;
