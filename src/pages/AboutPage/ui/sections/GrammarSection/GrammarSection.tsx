import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { AboutAnchor } from '@/shared/config/router/routePath';
import {
    ASPECT_GROUP_ORDER, ASPECT_GROUPS, GRAMMAR_TOPIC_ORDER, GRAMMAR_TOPICS, IRREGULAR_VERBS, TENSE_TIME_ORDER, TENSES,
} from '@/shared/const/grammar';
import { ROADMAP_STAGES } from '@/shared/const/roadmap';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';

import { LandingSection, LandingSectionTone } from '../../LandingSection';
import cls from './GrammarSection.module.scss';

const VERBS_ICON_SIZE = 22;
const VERBS_ICON_STROKE = 1.5;
const DEFAULT_TENSE = 'present-perfect';
/** Этап дорожной карты, на котором в демо стоит «Вы здесь» */
const DEMO_STAGE_INDEX = 1;
/** Случаев употребления в карточке выбранного времени */
const USAGE_LIMIT = 2;

/** Грамматика: матрица 12 времён, темы и дорожная карта A1 → B1 */
export const GrammarSection = memo(() => {
    const { t } = useTranslation();
    const [tenseId, setTenseId] = useState(DEFAULT_TENSE);
    const tense = TENSES.find((item) => item.id === tenseId) ?? TENSES[0];

    const timeLabels = {
        present: t('Наст.'),
        past: t('Прош.'),
        future: t('Буд.'),
    };

    return (
        <LandingSection
            id={AboutAnchor.GRAMMAR}
            tone={LandingSectionTone.SURFACE}
            index={5}
            kicker={t('Грамматика и путь к B1')}
            title={t('Не только слова: грамматика по плану')}
            lead={t('12 времён — это 4 идеи на 3 осях времени. Плюс 7 ключевых тем, практика с проверкой и дорожная карта, которая показывает следующий шаг.')}
        >
            <div className={cls.layout}>
                <div className={cls.tenses}>
                    <div className={cls.matrix}>
                        <span aria-hidden />
                        {TENSE_TIME_ORDER.map((time) => (
                            <span key={time} className={cls.timeHead}>{timeLabels[time]}</span>
                        ))}
                        {ASPECT_GROUP_ORDER.map((groupId) => (
                            <div key={groupId} className={cls.matrixRow}>
                                <span className={cls.groupHead}>
                                    <span className={cls.groupName}>{ASPECT_GROUPS[groupId].name}</span>
                                    <span className={cls.groupIdea}>{t(ASPECT_GROUPS[groupId].shortIdea)}</span>
                                </span>
                                {TENSE_TIME_ORDER.map((time) => {
                                    const cell = TENSES.find((item) => item.group === groupId && item.time === time);
                                    if (!cell) return null;
                                    return (
                                        <button
                                            key={cell.id}
                                            type="button"
                                            aria-pressed={cell.id === tenseId}
                                            aria-label={`${cell.name}: ${cell.shortExample}`}
                                            className={classNames(cls.cell, { [cls.cellActive]: cell.id === tenseId })}
                                            onClick={() => setTenseId(cell.id)}
                                        >
                                            {cell.shortExample}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className={cls.detail} aria-live="polite">
                        <div className={cls.detailHead}>
                            <span className={cls.detailName}>{tense.name}</span>
                            <code className={cls.formula}>{tense.formula.affirmative}</code>
                        </div>
                        <ul className={cls.usage}>
                            {tense.usage.slice(0, USAGE_LIMIT).map((usage) => <li key={usage}>{t(usage)}</li>)}
                        </ul>
                        <div className={cls.markers}>
                            {tense.markers.map((marker) => <span key={marker} className={cls.marker}>{marker}</span>)}
                        </div>
                    </div>
                </div>

                <div className={cls.side}>
                    <div className={cls.block}>
                        <Kicker size={KickerSize.SM}>{t('Дорожная карта')}</Kicker>
                        <ol className={cls.roadmap}>
                            {ROADMAP_STAGES.map((stage, i) => (
                                <li
                                    key={stage.id}
                                    className={classNames(cls.stage, {
                                        [cls.stageDone]: i < DEMO_STAGE_INDEX,
                                        [cls.stageCurrent]: i === DEMO_STAGE_INDEX,
                                    })}
                                >
                                    <span className={cls.stageLevel}>{stage.level}</span>
                                    <span className={cls.stageTitle}>{t(stage.title)}</span>
                                    {i === DEMO_STAGE_INDEX && (
                                        <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>{t('Вы здесь')}</Kicker>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className={cls.block}>
                        <Kicker size={KickerSize.SM}>{t('Темы с правилами и типичными ошибками')}</Kicker>
                        <div className={cls.topics}>
                            {GRAMMAR_TOPIC_ORDER.map((id) => (
                                <span key={id} className={cls.topic}>
                                    <span className={cls.topicLevel}>{GRAMMAR_TOPICS[id].level}</span>
                                    {t(GRAMMAR_TOPICS[id].name)}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={cls.verbs}>
                        <Languages size={VERBS_ICON_SIZE} strokeWidth={VERBS_ICON_STROKE} aria-hidden className={cls.verbsIcon} />
                        <div className={cls.verbsText}>
                            <span className={cls.verbsTitle}>
                                {t('{{count}} неправильных глаголов', { count: IRREGULAR_VERBS.length })}
                            </span>
                            <span className={cls.verbsNote}>
                                {t('По частоте, с тремя формами и переводом. Любая группа — колода в один клик.')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </LandingSection>
    );
});

GrammarSection.displayName = 'GrammarSection';
