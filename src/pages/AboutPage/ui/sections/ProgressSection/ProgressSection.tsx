import {
    CSSProperties, memo, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy } from 'lucide-react';
import { AboutAnchor } from '@/shared/config/router/routePath';
import { DAILY_GOAL_OPTIONS, DEFAULT_DAILY_GOAL } from '@/shared/const/const';
import { classNames } from '@/shared/lib/classNames/classNames';
import { getStreakLevel, STREAK_LEVEL_NAMES, STREAK_LEVEL_THRESHOLDS } from '@/shared/lib/streak';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import { StreakFlame } from '@/shared/ui/StreakFlame';

import { LandingSection, LandingSectionTone } from '../../LandingSection';
import {
    buildHeatmap, DAYS_IN_WEEK, HARD_WORDS, HEATMAP_WEEKS,
} from '../../demo/demoData';
import cls from './ProgressSection.module.scss';

const TROPHY_SIZE = 14;
/** Сколько карточек «уже пройдено сегодня» в моке кольца цели */
const DONE_TODAY = 14;
const DEMO_STREAK_DAYS = 9;
/** Минимальная сторона ячейки heatmap: недель показываем столько, сколько влезает при ней */
const HEAT_CELL_MIN = 12;
const DEFAULT_WEEKS = 52;
const HEAT_CLASSES = [cls.heat0, cls.heat1, cls.heat2, cls.heat3, cls.heat4];
/** Мок итога сессии и освоенности колоды */
const SESSION = {
    cards: 20, accuracy: 92, time: '6:40', mastered: 4,
};
const MASTERY = { mastered: 46, learning: 32 };

/** Прогресс и мотивация: серия, карта активности, дневная цель, итог сессии */
export const ProgressSection = memo(() => {
    const { t } = useTranslation();
    const [streak, setStreak] = useState(DEMO_STREAK_DAYS);
    const [goal, setGoal] = useState(DEFAULT_DAILY_GOAL);
    const heatmap = useMemo(buildHeatmap, []);
    const heatmapRef = useRef<HTMLDivElement>(null);
    const [weeks, setWeeks] = useState(DEFAULT_WEEKS);

    // Сетка заполняет карточку от края до края: число недель — по ширине, ячейки тянутся до целой колонки
    useLayoutEffect(() => {
        const el = heatmapRef.current;
        if (!el) return undefined;
        const measure = () => {
            const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
            const fit = Math.floor((el.clientWidth + gap) / (HEAT_CELL_MIN + gap));
            setWeeks(Math.max(1, Math.min(HEATMAP_WEEKS, fit)));
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Последние недели истории — свежие дни всегда справа
    const visibleDays = heatmap.slice(-weeks * DAYS_IN_WEEK);
    const level = getStreakLevel(streak);
    const goalShare = Math.min(DONE_TODAY / goal, 1) * 100;

    return (
        <LandingSection
            id={AboutAnchor.PROGRESS}
            tone={LandingSectionTone.SURFACE}
            index={7}
            kicker={t('Прогресс и мотивация')}
            title={t('Видно, что вы растёте — и хочется не прерывать серию')}
            lead={t('Серия дней с уровнями огня, карта активности, дневная цель и честный итог каждой сессии: точность, время и трудные слова.')}
        >
            <div className={cls.grid}>
                <article className={classNames(cls.card, [cls.wide])}>
                    <div className={cls.cardHead}>
                        <Kicker size={KickerSize.SM}>{t('Активность')}</Kicker>
                        <span className={cls.legend} aria-hidden>
                            {t('меньше')}
                            {HEAT_CLASSES.map((heat) => <i key={heat} className={classNames(cls.heatCell, [heat])} />)}
                            {t('больше')}
                        </span>
                    </div>
                    <div
                        ref={heatmapRef}
                        className={cls.heatmap}
                        // Число колонок — данные (сколько недель влезло), а не оформление
                        style={{ '--weeks': weeks } as CSSProperties}
                        aria-hidden
                    >
                        {visibleDays.map((value, i) => (
                            // Ячейки статичны — индекс стабилен
                            <i key={i} className={classNames(cls.heatCell, [HEAT_CLASSES[value]])} />
                        ))}
                    </div>
                </article>

                <article className={cls.card}>
                    <Kicker size={KickerSize.SM}>{t('Серия')}</Kicker>
                    <div className={cls.streak}>
                        <StreakFlame days={streak} />
                        <div className={cls.streakText}>
                            <span className={cls.streakDays}>{t('{{count}} дн. подряд', { count: streak })}</span>
                            <span className={cls.streakLevel}>{t(STREAK_LEVEL_NAMES[level.index])}</span>
                        </div>
                    </div>
                    <div className={cls.levels}>
                        {STREAK_LEVEL_THRESHOLDS.map((min, i) => (
                            <button
                                key={min}
                                type="button"
                                aria-pressed={level.index === i}
                                className={classNames(cls.levelBtn, { [cls.levelActive]: level.index === i })}
                                onClick={() => setStreak(min)}
                            >
                                {t(STREAK_LEVEL_NAMES[i])}
                            </button>
                        ))}
                    </div>
                    <span className={cls.note}>
                        {level.daysToNext === null
                            ? t('Максимальный уровень')
                            : t('До следующего уровня — {{count}} дн.', { count: level.daysToNext })}
                    </span>
                </article>

                <article className={cls.card}>
                    <Kicker size={KickerSize.SM}>{t('Дневная цель')}</Kicker>
                    <div className={cls.goal}>
                        <div
                            className={cls.ring}
                            // Заполнение кольца — данные, а не оформление
                            style={{ '--share': `${goalShare}%` } as CSSProperties}
                        >
                            <span className={cls.ringValue}>{`${DONE_TODAY}/${goal}`}</span>
                        </div>
                        <span className={cls.note}>{t('Выберите свой темп — сколько карточек в день')}</span>
                    </div>
                    <BoxSegmented<number>
                        className={cls.goalSwitch}
                        value={goal}
                        onChange={setGoal}
                        options={DAILY_GOAL_OPTIONS.map((value) => ({ label: String(value), value }))}
                    />
                </article>

                <article className={cls.card}>
                    <Kicker size={KickerSize.SM}>{t('Итог сессии')}</Kicker>
                    <dl className={cls.stats}>
                        <div className={cls.stat}>
                            <dt>{t('Карточек')}</dt>
                            <dd>{SESSION.cards}</dd>
                        </div>
                        <div className={cls.stat}>
                            <dt>{t('Точность')}</dt>
                            <dd>
                                {`${SESSION.accuracy}%`}
                                <span className={cls.record}>
                                    <Trophy size={TROPHY_SIZE} aria-hidden />
                                    {t('Личный рекорд')}
                                </span>
                            </dd>
                        </div>
                        <div className={cls.stat}>
                            <dt>{t('Время')}</dt>
                            <dd>{SESSION.time}</dd>
                        </div>
                        <div className={cls.stat}>
                            <dt>{t('Усвоено')}</dt>
                            <dd>{`+${SESSION.mastered}`}</dd>
                        </div>
                    </dl>
                    <div className={cls.hard}>
                        <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>{t('Трудные слова')}</Kicker>
                        <div className={cls.hardList}>
                            {HARD_WORDS.map((word) => <span key={word} className={cls.hardWord}>{word}</span>)}
                        </div>
                    </div>
                </article>

                <article className={cls.card}>
                    <Kicker size={KickerSize.SM}>{t('Освоение колоды')}</Kicker>
                    <span className={cls.masteryValue}>{`${MASTERY.mastered}%`}</span>
                    <div
                        className={cls.mastery}
                        // Ширины сегментов — данные, а не оформление
                        style={{
                            '--mastered': `${MASTERY.mastered}%`,
                            '--learning': `${MASTERY.learning}%`,
                        } as CSSProperties}
                    >
                        <i className={cls.masteryMastered} />
                        <i className={cls.masteryLearning} />
                    </div>
                    <div className={cls.masteryLegend}>
                        <span className={cls.legendMastered}>{t('Усвоено')}</span>
                        <span className={cls.legendLearning}>{t('Изучаю')}</span>
                        <span className={cls.legendNew}>{t('Новые')}</span>
                    </div>
                </article>
            </div>
        </LandingSection>
    );
});

ProgressSection.displayName = 'ProgressSection';
