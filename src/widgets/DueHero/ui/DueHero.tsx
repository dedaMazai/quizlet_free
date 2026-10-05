import { CSSProperties, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useGetDueCountQuery } from '@/entities/Card';
import { formatDayWeekday, useGetDueSummaryQuery } from '@/entities/Statistics';
import { AccentPanel } from '@/shared/ui/AccentPanel';
import { Blueprint, BlueprintCorners } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import { RoutePath } from '@/shared/config/router/routePath';
import { estimateReviewMinutes, ReviewLocationState } from '@/shared/const/const';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';
import cls from './DueHero.module.scss';

const ARROW_SIZE = 18;
const CHECK_SIZE = 96;
const CHECK_STROKE = 1.5;

interface DueHeroProps {
    /** Часовой пояс пользователя — для дней прогноза */
    tz: string;
    className?: string;
}

/** Hero главной: «К повторению сегодня», прогноз на неделю, старт повторения (Home 6.1) */
export const DueHero = memo((props: DueHeroProps) => {
    const { tz, className } = props;
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const { data: due } = useGetDueCountQuery(undefined);
    const { data: summary } = useGetDueSummaryQuery(tz);

    const count = due?.count ?? 0;
    const hasDebt = count > 0;
    const decksInDebt = summary?.perDeck.filter((deck) => deck.due > 0).length ?? 0;
    const tomorrowCount = summary?.forecast[1]?.count ?? 0;

    // Колода с наибольшим числом новых — для «Учить новые» при закрытом долге
    const learnDeckUuid = useMemo(() => {
        const best = summary?.perDeck.reduce<{ deckUuid: string; new: number } | null>(
            (acc, deck) => (deck.new > (acc?.new ?? 0) ? deck : acc),
            null,
        );
        return best?.deckUuid;
    }, [summary]);

    const bars = useMemo(() => {
        const forecast = summary?.forecast ?? [];
        const max = Math.max(0, ...forecast.map((day) => day.count));
        return forecast.map((day) => ({
            date: day.date,
            label: formatDayWeekday(day.date, i18n.language, 'short'),
            // Высота — данные, а не оформление: передаём через CSS-переменную
            style: { '--ratio': max > 0 ? day.count / max : 0 } as CSSProperties,
        }));
    }, [summary, i18n.language]);

    const start = () => {
        if (hasDebt) {
            const state: ReviewLocationState = { autostart: true };
            navigate(RoutePath.REVIEW(), { state });
        } else {
            navigate(learnDeckUuid ? RoutePath.LEARN(learnDeckUuid) : RoutePath.DECKS());
        }
    };

    useKeyDown((e) => {
        if (e.key === 'Enter') start();
    });

    return (
        <AccentPanel className={classNames(cls.DueHero, [className])}>
            <div className={cls.top}>
                <div className={cls.summary}>
                    <Kicker tone={KickerTone.ON_DARK}>{t('К повторению сегодня')}</Kicker>
                    <div className={cls.countRow}>
                        {hasDebt ? (
                            <span className={cls.count}>{count}</span>
                        ) : (
                            <Check
                                aria-hidden
                                className={cls.check}
                                size={CHECK_SIZE}
                                strokeWidth={CHECK_STROKE}
                            />
                        )}
                        <div className={cls.countText}>
                            <span className={cls.unit}>
                                {hasDebt ? t('карточки', { count }) : t('Долг закрыт')}
                            </span>
                            {hasDebt && (
                                <span className={cls.meta}>
                                    {`${t('из {{count}} колод', { count: decksInDebt })} · ${
                                        t('≈ {{count}} минут', { count: estimateReviewMinutes(count) })}`}
                                </span>
                            )}
                            {!hasDebt && tomorrowCount > 0 && (
                                <span className={cls.meta}>
                                    {t('Следующие {{count}} — завтра', { count: tomorrowCount })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className={cls.forecast}>
                    <Kicker size={KickerSize.SM} tone={KickerTone.ON_DARK}>
                        {t('Прогноз на неделю')}
                    </Kicker>
                    <div className={cls.bars}>
                        {bars.map((bar, i) => (
                            <div key={bar.date} className={cls.barCol}>
                                <div
                                    className={classNames(cls.bar, [], { [cls.barToday]: i === 0 })}
                                    style={bar.style}
                                />
                                <span className={cls.barLabel}>{bar.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={cls.actions}>
                <Blueprint
                    as="button"
                    corners={BlueprintCorners.LIGHT}
                    className={cls.primary}
                    onClick={start}
                >
                    {hasDebt ? t('Начать повторение') : t('Учить новые')}
                    <ArrowRight aria-hidden size={ARROW_SIZE} />
                </Blueprint>
                {hasDebt && (
                    <button
                        type="button"
                        className={cls.secondary}
                        onClick={() => navigate(RoutePath.REVIEW())}
                    >
                        {t('Выбрать колоды')}
                    </button>
                )}
                <span className={cls.hint}>{t('Enter — начать')}</span>
            </div>
        </AccentPanel>
    );
});

DueHero.displayName = 'DueHero';
