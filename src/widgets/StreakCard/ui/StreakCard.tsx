import { CSSProperties, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import {
    formatDayInTz,
    formatDayWeekday,
    lastWeekDates,
    useGetStudyHeatmapQuery,
    useGetStudyOverviewQuery,
    useTodayAnswers,
} from '@/entities/Statistics';
import { useDailyGoal } from '@/entities/UserSettings';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker } from '@/shared/ui/Kicker';
import { StreakFlame } from '@/shared/ui/StreakFlame';
import { classNames } from '@/shared/lib/classNames/classNames';
import { getStreakLevel, STREAK_LEVEL_NAMES, STREAK_LEVEL_THRESHOLDS } from '@/shared/lib/streak';
import cls from './StreakCard.module.scss';

const CHECK_SIZE = 14;
const CHECK_STROKE = 2;
/** С «Пламени» плашка уровня — светлым текстом на цвете уровня */
const LIGHT_TAG_LEVEL_INDEX = 2;
/** С «Жара» число серии окрашивается цветом уровня */
const COLORED_DAYS_LEVEL_INDEX = 3;
const LEVEL_CLASSES = [cls.level0, cls.level1, cls.level2, cls.level3, cls.level4];
const SCALE_CLASSES = [cls.scale0, cls.scale1, cls.scale2, cls.scale3, cls.scale4];
const PERCENT = 100;

interface StreakCardProps {
    /** Часовой пояс пользователя — для дней недели и «сегодня» */
    tz: string;
    className?: string;
}

/** Блок серии на главной: уровень огня, неделя, шкала уровней, цель дня (Home 6.1) */
export const StreakCard = memo((props: StreakCardProps) => {
    const { tz, className } = props;
    const { t, i18n } = useTranslation();

    const { data: overview } = useGetStudyOverviewQuery(tz);
    const { data: heatmap } = useGetStudyHeatmapQuery(tz);
    const todayAnswers = useTodayAnswers(tz);
    const goal = useDailyGoal();

    const days = overview?.currentStreak ?? 0;
    const record = overview?.longestStreak ?? 0;
    const level = getStreakLevel(days);

    const week = useMemo(() => {
        const counts = new Map((heatmap ?? []).map((day) => [day.date, day.count]));
        return lastWeekDates(Date.now()).map((date) => {
            const key = formatDayInTz(date, tz);
            return {
                key,
                label: formatDayWeekday(key, i18n.language, 'narrow'),
                done: (counts.get(key) ?? 0) > 0,
            };
        });
    }, [heatmap, tz, i18n.language]);

    const nextHint = level.daysToNext === null || level.nextMin === null
        ? t('Максимальный уровень — держите серию')
        : t('Ещё {{count}} дней — и огонь станет «{{level}}»', {
            count: level.daysToNext,
            level: t(STREAK_LEVEL_NAMES[level.index + 1]),
        });

    const goalLeft = Math.max(0, goal - todayAnswers);
    const goalStyle = {
        '--progress': `${Math.min(PERCENT, (todayAnswers / goal) * PERCENT)}%`,
    } as CSSProperties;

    return (
        <Blueprint className={classNames(cls.StreakCard, [className, LEVEL_CLASSES[level.index]])}>
            <div className={cls.header}>
                <div className={cls.title}>
                    <Kicker>{t('Серия')}</Kicker>
                    <span
                        className={classNames(cls.levelTag, [], {
                            [cls.levelTagLight]: level.index >= LIGHT_TAG_LEVEL_INDEX,
                        })}
                    >
                        {t(STREAK_LEVEL_NAMES[level.index])}
                    </span>
                </div>
                <span className={cls.record}>{t('рекорд — {{count}}', { count: record })}</span>
            </div>

            <div className={cls.streakRow}>
                <StreakFlame days={days} />
                <span
                    className={classNames(cls.days, [], {
                        [cls.daysColored]: level.index >= COLORED_DAYS_LEVEL_INDEX,
                    })}
                >
                    {days}
                </span>
                <span className={cls.daysUnit}>{t('дней подряд', { count: days })}</span>
            </div>

            <div className={cls.week}>
                {week.map((day, i) => (
                    <div key={day.key} className={cls.day}>
                        <div
                            className={classNames(cls.dayCell, [], {
                                [cls.dayDone]: day.done,
                                [cls.dayToday]: !day.done && i === week.length - 1,
                            })}
                        >
                            {day.done && (
                                <Check aria-hidden size={CHECK_SIZE} strokeWidth={CHECK_STROKE} />
                            )}
                        </div>
                        <span className={cls.dayLabel}>{day.label}</span>
                    </div>
                ))}
            </div>

            <div className={cls.levels}>
                <div className={cls.scale}>
                    {STREAK_LEVEL_THRESHOLDS.map((min, i) => (
                        <div key={min} className={cls.scaleStep}>
                            <i
                                className={classNames(cls.scaleBar, [], {
                                    [SCALE_CLASSES[i]]: i <= level.index,
                                })}
                            />
                            <span
                                className={classNames(cls.scaleLabel, [], {
                                    [cls.scaleLabelCurrent]: i === level.index,
                                })}
                            >
                                {`${min}+`}
                            </span>
                        </div>
                    ))}
                </div>
                <span className={cls.nextHint}>{nextHint}</span>
            </div>

            <div className={cls.goal}>
                <div className={cls.goalHead}>
                    <span>{t('Цель дня')}</span>
                    <span className={cls.goalValue}>{`${todayAnswers} / ${goal}`}</span>
                </div>
                <div className={cls.goalTrack} style={goalStyle}>
                    <div className={cls.goalFill} />
                </div>
                <span className={cls.goalNote}>
                    {goalLeft > 0
                        ? t('Ещё {{count}} карточек — и цель выполнена', { count: goalLeft })
                        : t('Цель дня выполнена')}
                </span>
            </div>
        </Blueprint>
    );
});

StreakCard.displayName = 'StreakCard';
