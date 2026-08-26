import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Button, Card, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { RoutePath } from '@/shared/config/router/routePath';
import { GRAMMAR_TOPIC_ORDER, GRAMMAR_TOPICS, GrammarTopicId } from '@/shared/const/grammar';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';

import cls from './GrammarTopicPage.module.scss';

const { Title, Text } = Typography;

const isGrammarTopicId = (value: string | undefined): value is GrammarTopicId => (
    GRAMMAR_TOPIC_ORDER.includes(value as GrammarTopicId)
);

const GrammarTopicPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { topic } = useParams<{ topic: string }>();

    if (!isGrammarTopicId(topic)) {
        return <Navigate to={RoutePath.ROADMAP()} replace />;
    }

    const info = GRAMMAR_TOPICS[topic];
    const topicIndex = GRAMMAR_TOPIC_ORDER.indexOf(topic);
    const prevTopic = GRAMMAR_TOPIC_ORDER[topicIndex - 1];
    const nextTopic = GRAMMAR_TOPIC_ORDER[topicIndex + 1];

    return (
        <VStack max gap="32" className={cls.GrammarTopicPage}>
            <VStack max gap="8">
                <HStack gap="12" wrap>
                    <Title level={1} className={cls.pageTitle}>{t(info.name)}</Title>
                    <Tag>{info.level}</Tag>
                    <Tag className={cls.enNameTag}>{info.enName}</Tag>
                </HStack>
                <MyTypography.Large type="secondary">{t(info.intro)}</MyTypography.Large>
            </VStack>

            <div className={cls.rulesGrid}>
                {info.rules.map((rule) => (
                    <Card
                        key={rule.title}
                        className={cls.ruleCard}
                        title={(
                            <HStack gap="8" wrap>
                                <Text strong>{t(rule.title)}</Text>
                                {rule.formula && <Tag className={cls.formulaTag}>{t(rule.formula)}</Tag>}
                            </HStack>
                        )}
                    >
                        <VStack max gap="12">
                            <Text type="secondary">{t(rule.note)}</Text>
                            <VStack max gap="8">
                                {rule.examples.map((example) => (
                                    <VStack key={example.en} max>
                                        <Text strong>{example.en}</Text>
                                        <Text type="secondary">{t(example.ru)}</Text>
                                    </VStack>
                                ))}
                            </VStack>
                        </VStack>
                    </Card>
                ))}
            </div>

            {info.mistakes.length > 0 && (
                <VStack max gap="16">
                    <Title level={3}>{t('Типичные ошибки')}</Title>
                    <Card className={cls.mistakesCard}>
                        <VStack max gap="16">
                            {info.mistakes.map((mistake) => (
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
                    </Card>
                </VStack>
            )}

            <HStack max justify="between" wrap gap="12">
                {prevTopic ? (
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(RoutePath.GRAMMAR_TOPIC(prevTopic))}
                    >
                        {t(GRAMMAR_TOPICS[prevTopic].name)}
                    </Button>
                ) : (
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(RoutePath.ROADMAP())}>
                        {t('Дорожная карта')}
                    </Button>
                )}
                {nextTopic && (
                    <Button
                        iconPosition="end"
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate(RoutePath.GRAMMAR_TOPIC(nextTopic))}
                    >
                        {t(GRAMMAR_TOPICS[nextTopic].name)}
                    </Button>
                )}
            </HStack>
        </VStack>
    );
};

export default GrammarTopicPage;
