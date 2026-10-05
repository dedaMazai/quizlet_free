import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Card, Tag, Typography } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { classNames } from '@/shared/lib/classNames/classNames';
import { RoutePath } from '@/shared/config/router/routePath';
import {
    ASPECT_GROUP_ORDER, ASPECT_GROUPS, TENSES, TENSE_TIME_ORDER, AspectGroupId, TenseTime,
} from '@/shared/const/grammar';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';

import cls from './GrammarTensesPage.module.scss';

const { Title, Text } = Typography;

const GROUP_CELL_CLASS: Record<AspectGroupId, string> = {
    simple: cls.cellSimple,
    continuous: cls.cellContinuous,
    perfect: cls.cellPerfect,
    'perfect-continuous': cls.cellPerfectContinuous,
};

const GrammarTensesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const timeLabels: Record<TenseTime, string> = {
        present: t('Настоящее'),
        past: t('Прошедшее'),
        future: t('Будущее'),
    };

    const iterations = [
        {
            group: 'simple' as const,
            title: t('Итерация 1 — Simple'),
            description: t('База: факты, привычки и события. Выучите формулы трёх времён Simple и их маркеры, составьте по 2–3 своих примера.'),
        },
        {
            group: 'continuous' as const,
            title: t('Итерация 2 — Continuous'),
            description: t('Процессы: действие «в кадре». Обратите внимание на сравнение с Simple — это самая частая путаница.'),
        },
        {
            group: 'perfect' as const,
            title: t('Итерация 3 — Perfect'),
            description: t('Результат к моменту. Ключевой контраст: Past Simple против Present Perfect. Понадобятся третьи формы неправильных глаголов.'),
        },
        {
            group: 'perfect-continuous' as const,
            title: t('Итерация 4 — Perfect Continuous'),
            description: t('Длительность до момента: «как долго». Сравните с Perfect (результат) и Continuous (процесс сейчас).'),
        },
        {
            group: null,
            title: t('Итерация 5 — контрасты и повторение'),
            description: t('Пройдите блоки сравнений на страницах групп и восстановите сводную таблицу по памяти. Возвращайтесь к таблице раз в несколько дней.'),
        },
    ];

    const decisionSteps = [
        { question: t('Действие регулярно, это привычка или факт?'), answer: 'Simple' },
        { question: t('Действие идёт (шло) в конкретный момент?'), answer: 'Continuous' },
        { question: t('Важен результат к моменту, а не когда именно?'), answer: 'Perfect' },
        { question: t('Важно, как долго процесс длится к моменту?'), answer: 'Perfect Continuous' },
    ];

    return (
        <VStack max gap="32" className={cls.GrammarTensesPage}>
            <VStack max gap="16">
                <SectionPageHeader section={NavSectionKey.GRAMMAR} />
                <MyTypography.Large type="secondary">
                    {t('12 времён — это всего 4 идеи (аспекта) на 3 осях времени. Учите по одной группе за итерацию и регулярно возвращайтесь к сводной таблице.')}
                </MyTypography.Large>
            </VStack>

            <VStack max gap="16">
                <Title level={3}>{t('Сводная таблица')}</Title>
                <div className={cls.tableWrapper}>
                    <table className={cls.tenseTable}>
                        <thead>
                            <tr>
                                <th aria-label={t('Ось времени')} />
                                {ASPECT_GROUP_ORDER.map((groupId) => (
                                    <th key={groupId} className={GROUP_CELL_CLASS[groupId]}>
                                        <VStack gap="4">
                                            <Text strong>{ASPECT_GROUPS[groupId].name}</Text>
                                            <Text type="secondary" className={cls.formulaHint}>
                                                {ASPECT_GROUPS[groupId].formulaHint}
                                            </Text>
                                        </VStack>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TENSE_TIME_ORDER.map((time) => (
                                <tr key={time}>
                                    <th className={cls.timeHeader}>{timeLabels[time]}</th>
                                    {ASPECT_GROUP_ORDER.map((groupId) => {
                                        const tense = TENSES.find((item) => item.group === groupId && item.time === time);
                                        if (!tense) return <td key={groupId} />;
                                        return (
                                            <td
                                                key={groupId}
                                                className={classNames(cls.tenseCell, [GROUP_CELL_CLASS[groupId]])}
                                                onClick={() => navigate(RoutePath.GRAMMAR_TENSE_GROUP(groupId))}
                                            >
                                                <VStack gap="4">
                                                    <Text strong className={cls.cellFormula}>{tense.shortFormula}</Text>
                                                    <Text type="secondary" italic>{tense.shortExample}</Text>
                                                </VStack>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Text type="secondary">{t('Нажмите на ячейку, чтобы открыть подробный разбор группы.')}</Text>
            </VStack>

            <VStack max gap="16">
                <Title level={3}>{t('План изучения')}</Title>
                <VStack max gap="12">
                    {iterations.map((iteration, index) => (
                        <Card key={iteration.title} className={cls.iterationCard}>
                            <HStack max gap="16" align="start">
                                <div className={cls.iterationNumber}>{index + 1}</div>
                                <VStack max gap="8">
                                    <Text strong>{iteration.title}</Text>
                                    <Text type="secondary">{iteration.description}</Text>
                                    <HStack gap="8" wrap>
                                        {iteration.group && (
                                            <Button
                                                size="small"
                                                onClick={() => navigate(RoutePath.GRAMMAR_TENSE_GROUP(iteration.group))}
                                            >
                                                {t('Открыть группу')}
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            icon={<ThunderboltOutlined />}
                                            onClick={() => navigate(iteration.group
                                                ? `${RoutePath.GRAMMAR_PRACTICE()}?group=${iteration.group}`
                                                : RoutePath.GRAMMAR_PRACTICE())}
                                        >
                                            {t('Практика')}
                                        </Button>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </Card>
                    ))}
                </VStack>
            </VStack>

            <VStack max gap="16">
                <Title level={3}>{t('Как выбрать время')}</Title>
                <Card>
                    <VStack max gap="12">
                        {decisionSteps.map((step) => (
                            <HStack key={step.answer} max gap="12" wrap>
                                <Text>{step.question}</Text>
                                <Tag className={cls.answerTag}>{step.answer}</Tag>
                            </HStack>
                        ))}
                    </VStack>
                </Card>
            </VStack>
        </VStack>
    );
};

export default GrammarTensesPage;
