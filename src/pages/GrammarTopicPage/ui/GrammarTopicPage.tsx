import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router';
import { Button } from 'antd';
import { ArrowRight, Check, ChevronLeft } from 'lucide-react';
import { BackLink } from '@/shared/ui/BackLink';
import { RoutePath } from '@/shared/config/router/routePath';
import { GRAMMAR_TOPIC_ORDER, GRAMMAR_TOPICS, GrammarTopicId } from '@/shared/const/grammar';
import { LOCAL_STORAGE_ROADMAP_DONE_STEPS_KEY } from '@/shared/const/localstorage';
import { ROADMAP_STAGES, ROADMAP_STEPS_TOTAL } from '@/shared/const/roadmap';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker } from '@/shared/ui/Kicker';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import cls from './GrammarTopicPage.module.scss';

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;
const NO_STEPS: string[] = [];

const ALL_STEPS = ROADMAP_STAGES.flatMap((stage) => stage.steps);

const isGrammarTopicId = (value: string | undefined): value is GrammarTopicId => (
    GRAMMAR_TOPIC_ORDER.includes(value as GrammarTopicId)
);

const GrammarTopicPage = () => {
    const { t } = useTranslation();
    const { topic } = useParams<{ topic: string }>();
    const [doneSteps, setDoneSteps] = useLocalStorage<string[]>(LOCAL_STORAGE_ROADMAP_DONE_STEPS_KEY, NO_STEPS);

    if (!isGrammarTopicId(topic)) {
        return <Navigate to={RoutePath.ROADMAP()} replace />;
    }

    const info = GRAMMAR_TOPICS[topic];
    const topicIndex = GRAMMAR_TOPIC_ORDER.indexOf(topic);
    const prevTopic = GRAMMAR_TOPIC_ORDER[topicIndex - 1];
    const nextTopic = GRAMMAR_TOPIC_ORDER[topicIndex + 1];

    // Шаг дорожной карты с тем же id, что и тема
    const stageIndex = ROADMAP_STAGES.findIndex((stage) => stage.steps.some((step) => step.id === topic));
    const step = ALL_STEPS.find((item) => item.id === topic);
    const isDone = doneSteps.includes(topic);

    const toggleDone = () => {
        setDoneSteps((prev) => (
            prev.includes(topic) ? prev.filter((id) => id !== topic) : [...prev, topic]
        ));
    };

    return (
        <div className={cls.GrammarTopicPage}>
            <div className={cls.header}>
                <BackLink
                    items={[
                        { label: t('Учить'), to: RoutePath.REVIEW() },
                        { label: t('Дорожная карта'), to: RoutePath.ROADMAP() },
                        ...(stageIndex >= 0 ? [{ label: t('Этап {{number}}', { number: stageIndex + 1 }) }] : []),
                    ]}
                />
                <div className={cls.titleRow}>
                    <div className={cls.titleBlock}>
                        <Kicker>
                            {step
                                ? t('Тема · {{level}} · шаг {{step}} из {{total}}', {
                                    level: info.level,
                                    step: ALL_STEPS.indexOf(step) + 1,
                                    total: ROADMAP_STEPS_TOTAL,
                                })
                                : t('Тема · {{level}}', { level: info.level })}
                        </Kicker>
                        <h1 className={cls.title}>{t(info.name)}</h1>
                        <span className={cls.subtitle}>{t(step?.description ?? info.intro)}</span>
                    </div>
                    {step && (
                        <Button
                            className={cls.markDone}
                            aria-pressed={isDone}
                            icon={<Check aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                            onClick={toggleDone}
                        >
                            {isDone ? t('Пройдено') : t('Отметить пройденным')}
                        </Button>
                    )}
                </div>
            </div>

            <div className={cls.rules}>
                {info.rules.map((rule) => (
                    <Blueprint key={rule.title} className={cls.rule}>
                        <span className={cls.mark}>{rule.mark}</span>
                        <span className={cls.ruleTitle}>{t(rule.title)}</span>
                        <span className={cls.note}>{t(rule.note)}</span>
                        <div className={cls.examples}>
                            {rule.examples.map((example) => (
                                <span key={example.en} className={cls.example}>{example.en}</span>
                            ))}
                        </div>
                    </Blueprint>
                ))}
            </div>

            {info.mistakes.length > 0 && (
                <div className={cls.mistakes}>
                    <SectionHeader title={t('Типичные ошибки')} />
                    {info.mistakes.map((mistake) => (
                        <div key={mistake.wrong} className={cls.mistake}>
                            <span className={cls.wrong}>{mistake.wrong}</span>
                            <ArrowRight aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} className={cls.arrow} />
                            <span className={cls.right}>{mistake.right}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className={cls.footer}>
                {prevTopic ? (
                    <Link to={RoutePath.GRAMMAR_TOPIC(prevTopic)} className={cls.prev}>
                        <ChevronLeft aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                        {t(GRAMMAR_TOPICS[prevTopic].name)}
                    </Link>
                ) : <span />}
                {nextTopic && (
                    <Link to={RoutePath.GRAMMAR_TOPIC(nextTopic)} className={cls.next}>
                        <BlueprintMarks />
                        {t('Дальше: {{topic}}', { topic: t(GRAMMAR_TOPICS[nextTopic].name) })}
                        <ArrowRight aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default GrammarTopicPage;
