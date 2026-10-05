import { CSSProperties, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useGetDueCountQuery } from '@/entities/Card';
import { formatDayWeekday, selectLearnDeckUuid, useGetDueSummaryQuery } from '@/entities/Statistics';
import { AccentPanel } from '@/shared/ui/AccentPanel';
import { Blueprint, BlueprintCorners } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import { FadeIn, Skeleton, SkeletonTone } from '@/shared/ui/Skeleton';
import { RoutePath } from '@/shared/config/router/routePath';
import { estimateReviewMinutes, ReviewLocationState } from '@/shared/const/const';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';
import { useCountUp } from '@/shared/lib/hooks/useCountUp';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { useOncePerDay } from '@/shared/lib/hooks/useOncePerDay';
import cls from './DueHero.module.scss';

const ARROW_SIZE = 18;
const CHECK_SIZE = 96;
const CHECK_STROKE = 1.5;

interface DueCountProps {
    value: number;
    celebrate: boolean;
}

/** Число долга: в первый показ за день — count-up 0→N; монтируется уже с данными */
const DueCount = ({ value, celebrate }: DueCountProps) => {
    const shown = useCountUp(value, { enabled: celebrate });

    return (
        <span className={cls.count} aria-label={String(value)}>
            <span aria-hidden>{shown}</span>
        </span>
    );
};

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
    const { isMobile } = useMatchMedia();
    // Count-up и рост столбиков — «праздник», раз в день
    const celebrate = useOncePerDay('due-hero');

    const { data: due, isLoading: isDueLoading } = useGetDueCountQuery(undefined);
    const { data: summary, isLoading: isSummaryLoading } = useGetDueSummaryQuery({ tz });
    // До загрузки count = 0 — без скелетона мелькал бы «Долг закрыт»
    const isLoading = isDueLoading || isSummaryLoading;

    const count = due?.count ?? 0;
    const hasDebt = count > 0;
    const decksInDebt = summary?.perDeck.filter((deck) => deck.due > 0).length ?? 0;
    const tomorrowCount = summary?.forecast[1]?.count ?? 0;

    // Колода с наибольшим числом новых — для «Учить новые» при закрытом долге
    const learnDeckUuid = useMemo(() => selectLearnDeckUuid(summary), [summary]);

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

    const reviewMinutes = estimateReviewMinutes(count);
    // Мобильная (6.35): «≈ 8 мин»
    const minutes = isMobile
        ? t('≈ {{count}} мин', { count: reviewMinutes })
        : t('≈ {{count}} минут', { count: reviewMinutes });

    const start = () => {
        if (hasDebt) {
            const state: ReviewLocationState = { autostart: true };
            navigate(RoutePath.REVIEW(), { state });
        } else {
            navigate(learnDeckUuid ? RoutePath.LEARN(learnDeckUuid) : RoutePath.DECKS());
        }
    };

    useKeyDown((e) => {
        if (e.key === 'Enter' && !isLoading) start();
    });

    if (isLoading) {
        return (
            <AccentPanel className={classNames(cls.DueHero, [className])}>
                <div className={cls.top}>
                    <div className={cls.summary}>
                        <Kicker tone={KickerTone.ON_DARK} className={cls.kicker}>
                            {t('К повторению сегодня')}
                        </Kicker>
                        <div className={cls.countRow}>
                            <Skeleton tone={SkeletonTone.ON_DARK} className={cls.countSkeleton} />
                            <div className={cls.countText}>
                                <Skeleton tone={SkeletonTone.ON_DARK} className={cls.unitSkeleton} />
                                <Skeleton tone={SkeletonTone.ON_DARK} className={cls.metaSkeleton} />
                            </div>
                        </div>
                    </div>
                    <div className={cls.forecast}>
                        <Kicker size={KickerSize.SM} tone={KickerTone.ON_DARK}>
                            {t('Прогноз на неделю')}
                        </Kicker>
                        <Skeleton tone={SkeletonTone.ON_DARK} className={cls.barsSkeleton} />
                    </div>
                </div>
                <div className={cls.actions}>
                    <Skeleton tone={SkeletonTone.ON_DARK} className={cls.primarySkeleton} />
                </div>
            </AccentPanel>
        );
    }

    return (
        <AccentPanel className={classNames(cls.DueHero, [className])}>
            <FadeIn className={cls.top}>
                <div className={cls.summary}>
                    <Kicker tone={KickerTone.ON_DARK} className={cls.kicker}>
                        {t('К повторению сегодня')}
                    </Kicker>
                    <div className={cls.countRow}>
                        {hasDebt ? (
                            <DueCount value={count} celebrate={celebrate} />
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
                                    {`${t('из {{count}} колод', { count: decksInDebt })} · ${minutes}`}
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
                    <div className={classNames(cls.bars, [], { [cls.celebrate]: celebrate })}>
                        {bars.map((bar, i) => (
                            <div key={bar.date} className={cls.barCol}>
                                <div
                                    className={classNames(cls.bar, [], { [cls.barToday]: i === 0 })}
                                    style={{ ...bar.style, '--i': i } as CSSProperties}
                                />
                                <span className={cls.barLabel}>{bar.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </FadeIn>
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
