import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Button } from 'antd';
import { ArrowRight } from 'lucide-react';
import { BackLink } from '@/shared/ui/BackLink';
import { classNames } from '@/shared/lib/classNames/classNames';
import { RoutePath } from '@/shared/config/router/routePath';
import {
    ASPECT_GROUP_ORDER, ASPECT_GROUPS, TENSES, TENSE_COMPARISONS, AspectGroupId,
} from '@/shared/const/grammar';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { SectionHeader } from '@/shared/ui/SectionHeader';

import cls from './TenseGroupPage.module.scss';

const ARROW_SIZE = 16;

const isAspectGroupId = (value: string | undefined): value is AspectGroupId => (
    ASPECT_GROUP_ORDER.includes(value as AspectGroupId)
);

/** Случаи употребления одной фразой: «Первый; второй; третий.» */
const joinUsage = (items: string[]): string => `${items
    .map((item, index) => (index === 0 ? item : item.charAt(0).toLowerCase() + item.slice(1)))
    .join('; ')}.`;

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

    return (
        <div className={cls.TenseGroupPage}>
            <div className={cls.header}>
                <BackLink
                    items={[
                        { label: t('Грамматика'), to: RoutePath.GRAMMAR_TENSES() },
                        { label: t('Времена'), to: RoutePath.GRAMMAR_TENSES() },
                    ]}
                />
                <div className={cls.titleRow}>
                    <div className={cls.titleBlock}>
                        <Kicker>
                            {t('Группа {{index}} из {{total}} · {{focus}}', {
                                index: ASPECT_GROUP_ORDER.indexOf(group) + 1,
                                total: ASPECT_GROUP_ORDER.length,
                                focus: t(groupInfo.focus),
                            })}
                        </Kicker>
                        <div className={cls.titleLine}>
                            <h1 className={cls.title}>{groupInfo.name}</h1>
                            <span className={cls.groupFormula}>{groupInfo.formulaHint}</span>
                        </div>
                    </div>
                    <Button
                        type="primary"
                        className={cls.practice}
                        onClick={() => navigate(`${RoutePath.GRAMMAR_PRACTICE()}?group=${group}`)}
                    >
                        <BlueprintMarks />
                        {t('Практиковаться')}
                        <ArrowRight aria-hidden size={ARROW_SIZE} strokeWidth={1.5} />
                    </Button>
                </div>
            </div>

            <div className={cls.tenses}>
                {tenses.map((tense) => {
                    const mistake = tense.mistakes[0];

                    return (
                        <Blueprint key={tense.id} className={cls.tense}>
                            <div className={cls.field}>
                                <span className={cls.tenseName}>{tense.name}</span>
                                <span className={cls.tenseFormula}>{tense.shortFormula}</span>
                            </div>
                            <div className={cls.field}>
                                <Kicker size={KickerSize.SM}>{t('Когда')}</Kicker>
                                <span className={cls.text}>{joinUsage(tense.usage.map((item) => t(item)))}</span>
                            </div>
                            <div className={cls.markersField}>
                                <Kicker size={KickerSize.SM}>{t('Маркеры')}</Kicker>
                                <div className={cls.markers}>
                                    {tense.markers.map((marker) => (
                                        <span key={marker} className={cls.marker}>{marker}</span>
                                    ))}
                                </div>
                            </div>
                            <div className={cls.field}>
                                <Kicker size={KickerSize.SM}>{t('Примеры')}</Kicker>
                                {tense.examples.map((example) => (
                                    <span key={example.en} className={cls.example}>{example.en}</span>
                                ))}
                            </div>
                            {mistake && (
                                <div className={cls.mistake}>
                                    <Kicker size={KickerSize.SM}>{t('Типичная ошибка')}</Kicker>
                                    <span className={cls.wrong}>{mistake.wrong}</span>
                                    <span className={cls.right}>{mistake.right}</span>
                                </div>
                            )}
                        </Blueprint>
                    );
                })}
            </div>

            {comparisons.map((comparison) => {
                // Подсвечивается сторона, относящаяся к текущей группе
                const [leftGroup] = comparison.groups;

                return (
                    <div key={comparison.id} className={cls.comparison}>
                        <SectionHeader
                            title={t('Сравнение: {{left}} ↔ {{right}}', {
                                left: comparison.leftLabel,
                                right: comparison.rightLabel,
                            })}
                        />
                        <div className={cls.compareGrid}>
                            <div className={classNames(cls.side, [], { [cls.sideCurrent]: leftGroup === group })}>
                                <span className={cls.sideTitle}>{t(comparison.leftTitle)}</span>
                                <span className={cls.sideNote}>{t(comparison.leftNote)}</span>
                                {comparison.rows.map((row) => (
                                    <span key={row.left.en} className={cls.sideExample}>{row.left.en}</span>
                                ))}
                            </div>
                            <div className={classNames(cls.side, [], { [cls.sideCurrent]: leftGroup !== group })}>
                                <span className={cls.sideTitle}>{t(comparison.rightTitle)}</span>
                                <span className={cls.sideNote}>{t(comparison.rightNote)}</span>
                                {comparison.rows.map((row) => (
                                    <span key={row.right.en} className={cls.sideExample}>{row.right.en}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TenseGroupPage;
