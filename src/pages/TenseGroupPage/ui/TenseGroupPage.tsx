import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Button, Card, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { BackLink } from '@/shared/ui/BackLink';
import { classNames } from '@/shared/lib/classNames/classNames';
import { RoutePath } from '@/shared/config/router/routePath';
import {
    ASPECT_GROUP_ORDER, ASPECT_GROUPS, TENSES, TENSE_COMPARISONS, AspectGroupId, TenseTime,
} from '@/shared/const/grammar';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';

import cls from './TenseGroupPage.module.scss';

const { Title, Text } = Typography;

const isAspectGroupId = (value: string | undefined): value is AspectGroupId => (
    ASPECT_GROUP_ORDER.includes(value as AspectGroupId)
);

// Цвет группы совпадает с колонкой сводной таблицы — визуальный якорь для запоминания.
const GROUP_ACCENT_CLASS: Record<AspectGroupId, string> = {
    simple: cls.accentSimple,
    continuous: cls.accentContinuous,
    perfect: cls.accentPerfect,
    'perfect-continuous': cls.accentPerfectContinuous,
};

const TenseGroupPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { group } = useParams<{ group: string }>();

    if (!isAspectGroupId(group)) {
        return <Navigate to={RoutePath.GRAMMAR_TENSES()} replace />;
    }

    const groupInfo = ASPECT_GROUPS[group];
    const tenses = TENSES.filter((tense) => tense.group === group);
    const comparisons = TENSE_COMPARISONS.filter((comparison) => comparison.groups.includes(group));

    const groupIndex = ASPECT_GROUP_ORDER.indexOf(group);
    const prevGroup = ASPECT_GROUP_ORDER[groupIndex - 1];
    const nextGroup = ASPECT_GROUP_ORDER[groupIndex + 1];

    const timeLabels: Record<TenseTime, string> = {
        present: t('Настоящее'),
        past: t('Прошедшее'),
        future: t('Будущее'),
    };

    return (
        <VStack max gap="32" className={cls.TenseGroupPage}>
            <VStack max gap="8">
                <BackLink
                    items={[
                        { label: t('Грамматика'), to: RoutePath.GRAMMAR_TENSES() },
                        { label: t('Времена'), to: RoutePath.GRAMMAR_TENSES() },
                    ]}
                />
                <HStack max gap="12" wrap justify="between">
                    <HStack gap="12" wrap>
                        <Title level={1} className={cls.pageTitle}>{groupInfo.name}</Title>
                        <Tag className={cls.formulaTag}>{groupInfo.formulaHint}</Tag>
                    </HStack>
                    <Button
                        type="primary"
                        icon={<ThunderboltOutlined />}
                        onClick={() => navigate(`${RoutePath.GRAMMAR_PRACTICE()}?group=${group}`)}
                    >
                        {t('Практиковаться')}
                    </Button>
                </HStack>
                <MyTypography.Large type="secondary">{t(groupInfo.idea)}</MyTypography.Large>
            </VStack>

            <div className={cls.tensesGrid}>
                {tenses.map((tense) => (
                    <Card
                        key={tense.id}
                        className={classNames(cls.tenseCard, [GROUP_ACCENT_CLASS[group]])}
                        title={(
                            <HStack gap="8" wrap>
                                <Text strong>{tense.name}</Text>
                                <Tag>{timeLabels[tense.time]}</Tag>
                            </HStack>
                        )}
                    >
                        <VStack max gap="16">
                            <VStack max gap="4" className={cls.formulaBlock}>
                                <HStack gap="8">
                                    <Text className={classNames(cls.formulaSign, [cls.signPlus])}>+</Text>
                                    <Text strong className={cls.formula}>{tense.formula.affirmative}</Text>
                                </HStack>
                                <HStack gap="8">
                                    <Text className={classNames(cls.formulaSign, [cls.signMinus])}>−</Text>
                                    <Text strong className={cls.formula}>{tense.formula.negative}</Text>
                                </HStack>
                                <HStack gap="8">
                                    <Text className={classNames(cls.formulaSign, [cls.signQuestion])}>?</Text>
                                    <Text strong className={cls.formula}>{tense.formula.question}</Text>
                                </HStack>
                            </VStack>

                            <VStack max gap="4">
                                <Text type="secondary">{t('Когда употреблять')}</Text>
                                <ul className={cls.usageList}>
                                    {tense.usage.map((item) => (
                                        <li key={item}>{t(item)}</li>
                                    ))}
                                </ul>
                            </VStack>

                            <VStack max gap="4">
                                <Text type="secondary">{t('Маркеры')}</Text>
                                <HStack gap="4" wrap>
                                    {tense.markers.map((marker) => (
                                        <Tag key={marker}>{marker}</Tag>
                                    ))}
                                </HStack>
                            </VStack>

                            <VStack max gap="8">
                                <Text type="secondary">{t('Примеры')}</Text>
                                {tense.examples.map((example) => (
                                    <VStack key={example.en} max>
                                        <Text strong>{example.en}</Text>
                                        <Text type="secondary">{t(example.ru)}</Text>
                                    </VStack>
                                ))}
                            </VStack>

                            {tense.mistakes.length > 0 && (
                                <VStack max gap="8">
                                    <Text type="secondary">{t('Типичные ошибки')}</Text>
                                    {tense.mistakes.map((mistake) => (
                                        <VStack key={mistake.wrong} max>
                                            <HStack gap="8" wrap>
                                                <Text delete type="danger">{mistake.wrong}</Text>
                                                <Text>→</Text>
                                                <Text strong className={cls.rightAnswer}>{mistake.right}</Text>
                                            </HStack>
                                            <Text type="secondary">{t(mistake.note)}</Text>
                                        </VStack>
                                    ))}
                                </VStack>
                            )}
                        </VStack>
                    </Card>
                ))}
            </div>

            {comparisons.length > 0 && (
                <VStack max gap="16">
                    <Title level={3}>{t('Сравнение')}</Title>
                    {comparisons.map((comparison) => (
                        <Card key={comparison.id} className={cls.comparisonCard}>
                            <VStack max gap="16">
                                <Text strong>
                                    {comparison.leftLabel}
                                    {' vs '}
                                    {comparison.rightLabel}
                                </Text>
                                <Text type="secondary">{t(comparison.summary)}</Text>
                                {comparison.rows.map((row) => (
                                    <div key={row.left.en} className={cls.comparisonRow}>
                                        <VStack className={cls.comparisonSide}>
                                            <Text strong>{row.left.en}</Text>
                                            <Text type="secondary">{t(row.left.ru)}</Text>
                                        </VStack>
                                        <VStack className={cls.comparisonSide}>
                                            <Text strong>{row.right.en}</Text>
                                            <Text type="secondary">{t(row.right.ru)}</Text>
                                        </VStack>
                                    </div>
                                ))}
                            </VStack>
                        </Card>
                    ))}
                </VStack>
            )}

            <HStack max justify="between" wrap gap="12">
                {prevGroup ? (
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(RoutePath.GRAMMAR_TENSE_GROUP(prevGroup))}
                    >
                        {ASPECT_GROUPS[prevGroup].name}
                    </Button>
                ) : (
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(RoutePath.GRAMMAR_TENSES())}>
                        {t('План и обзор')}
                    </Button>
                )}
                {nextGroup && (
                    <Button
                        iconPosition="end"
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate(RoutePath.GRAMMAR_TENSE_GROUP(nextGroup))}
                    >
                        {ASPECT_GROUPS[nextGroup].name}
                    </Button>
                )}
            </HStack>
        </VStack>
    );
};

export default TenseGroupPage;
