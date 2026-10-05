import {
  FC, ReactNode, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  useGetCardReviewsQuery, useGetCardsQuery, useGetDueCountQuery,
} from '@/entities/Card';
import {
  formatDayInTz, lastWeekDates, useGetStudyHeatmapQuery, useGetStudyOverviewQuery,
} from '@/entities/Statistics';
import { useUserInfo } from '@/entities/User';
import { ROUND_SIZE } from '@/features/LearnSession';
import { AccentPanel } from '@/shared/ui/AccentPanel';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';
import { SectionHeader, SectionHeaderSize } from '@/shared/ui/SectionHeader';
import { SessionButton, SessionButtonVariant } from '@/shared/ui/SessionButton';
import { RoutePath } from '@/shared/config/router/routePath';
import { LOCAL_STORAGE_SESSION_BEST_ACCURACY_KEY } from '@/shared/const/localstorage';
import { EASE, MOTION_MS } from '@/shared/const/motion';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { useReducedMotion } from '@/shared/lib/hooks/useReducedMotion';
import { SessionRouteState, SessionSummary } from '@/shared/lib/session';
import { getStreakLevel, STREAK_LEVEL_NAMES } from '@/shared/lib/streak';
import { formatDuration } from '../model/sessionResult';
import cls from './SessionResult.module.scss';

const FLAME_SIZE = 48;
const MOBILE_FLAME_SIZE = 36;
const FLAME_STROKE = 1.25;
const ARROW_SIZE = 16;
const ICON_STROKE = 1.5;
const LEVEL_CLASSES = [cls.level0, cls.level1, cls.level2, cls.level3, cls.level4];

// Последовательность итога (BACKLOG §8): серия N-1 → N перелистыванием, огонь «вспыхивает», статистика по очереди
const SECONDS = 1000;
const DELIBERATE = { duration: MOTION_MS.deliberate / SECONDS, ease: EASE.enter };
const FADE = { duration: MOTION_MS.instant / SECONDS, ease: 'linear' } as const;
const FLAME_PULSE = 1.08;
/** Новый уровень серии — огонь вспыхивает сильнее */
const FLAME_LEVEL_UP_PULSE = 1.15;
const STAT_SHIFT = 12;

interface SessionWord {
  uuid: string;
  term: string;
}

interface SessionResultAction {
  label: ReactNode;
  onClick: () => void;
  /** Стрелка → — только у перехода дальше («Ещё N новых») */
  withArrow?: boolean;
}

interface SessionResultProps {
  summary: SessionSummary;
  /** Слова сессии — для «Трудных слов» */
  words: SessionWord[];
  onRestart: () => void;
  /** Колода сессии — для «Ещё N новых из «…»» */
  deckId?: string;
  deckName?: string;
  /** Своё главное действие вместо «Ещё N новых» / «Пройти заново» */
  primaryAction?: SessionResultAction;
  /** Запуск по трудным словам; по умолчанию — тот же маршрут с их uuid в state */
  onRepeatHard?: (cardUuids: string[]) => void;
  /** false — ответы не настоящие (просмотр карточек): точность «—», рекорд не пишется */
  trackAccuracy?: boolean;
  className?: string;
}

const readBestAccuracy = (): number | null => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_SESSION_BEST_ACCURACY_KEY);
    return stored === null ? null : Number(stored);
  } catch {
    return null;
  }
};

/** Итог сессии (6.17): серия, неделя, 4 показателя, трудные слова и 3 действия */
export const SessionResult: FC<SessionResultProps> = (props) => {
  const {
    summary, words, onRestart, deckId, deckName, primaryAction, onRepeatHard, trackAccuracy = true, className,
  } = props;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useMatchMedia();
  const reducedMotion = useReducedMotion();
  const user = useUserInfo();
  const tz = useMemo(
    () => user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    [user?.timezone],
  );

  const { data: overview, isFetching: isOverviewFetching } = useGetStudyOverviewQuery({ tz });
  const { data: heatmap, isFetching: isHeatmapFetching } = useGetStudyHeatmapQuery({ tz });
  const { data: due } = useGetDueCountQuery(undefined);
  const { data: deckCards } = useGetCardsQuery(deckId, { skip: !deckId });
  const { data: deckReviews } = useGetCardReviewsQuery(deckId, { skip: !deckId });

  // Рекорд точности хранится локально: прошлый лучший читаем один раз, до записи нового
  const [prevBest] = useState(readBestAccuracy);
  const isRecord = trackAccuracy && prevBest !== null && summary.answers > 0 && summary.accuracy > prevBest;
  useEffect(() => {
    if (!trackAccuracy || summary.answers === 0 || (prevBest !== null && summary.accuracy <= prevBest)) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_SESSION_BEST_ACCURACY_KEY, String(summary.accuracy));
    } catch {
      // Без localStorage рекорд просто не запоминается
    }
  }, [trackAccuracy, prevBest, summary.accuracy, summary.answers]);

  const streak = overview?.currentStreak ?? 0;
  const longest = overview?.longestStreak ?? 0;

  const week = useMemo(() => {
    const counts = new Map((heatmap ?? []).map((day) => [day.date, day.count]));
    const weekday = new Intl.DateTimeFormat(i18n.language, { weekday: 'short', timeZone: tz });
    return lastWeekDates(Date.now()).map((date) => ({
      key: formatDayInTz(date, tz),
      label: weekday.format(date),
      active: (counts.get(formatDayInTz(date, tz)) ?? 0) > 0,
    }));
  }, [heatmap, tz, i18n.language]);

  // День открыт этой сессией, если все сегодняшние ответы — её
  const todayCount = heatmap?.find((day) => day.date === formatDayInTz(new Date(), tz))?.count ?? 0;
  const dayAdded = summary.answers > 0 && todayCount <= summary.answers;

  // Перелистывание серии — по событию: день открыт этой сессией и статистика уже свежая
  const statsReady = Boolean(overview && heatmap) && !isOverviewFetching && !isHeatmapFetching;
  const celebrateStreak = statsReady && dayAdded && streak > 0 && !reducedMotion;
  const [streakShown, setStreakShown] = useState(false);
  useEffect(() => {
    if (!celebrateStreak) return undefined;
    const timer = setTimeout(() => setStreakShown(true), MOTION_MS.deliberate);
    return () => clearTimeout(timer);
  }, [celebrateStreak]);
  const shownStreak = celebrateStreak && !streakShown ? streak - 1 : streak;
  const level = getStreakLevel(shownStreak);
  const levelUp = celebrateStreak && getStreakLevel(streak - 1).index < getStreakLevel(streak).index;

  const newCount = useMemo(() => {
    if (!deckCards || !deckReviews) return 0;
    const studied = new Set(deckReviews.filter((r) => r.reps > 0).map((r) => r.card_uuid));
    return Math.min(ROUND_SIZE, deckCards.filter((card) => !studied.has(card.uuid)).length);
  }, [deckCards, deckReviews]);

  const hardWords = useMemo(() => {
    const byUuid = new Map(words.map((word) => [word.uuid, word]));
    return summary.hardUuids.flatMap((uuid) => byUuid.get(uuid) ?? []);
  }, [words, summary.hardUuids]);

  const repeatHard = () => {
    const uuids = hardWords.map((word) => word.uuid);
    if (onRepeatHard) {
      onRepeatHard(uuids);
      return;
    }
    const state: SessionRouteState = { cardUuids: uuids };
    navigate(location.pathname, { state });
  };

  let primary: SessionResultAction = { label: t('Пройти заново'), onClick: onRestart };
  if (primaryAction) {
    primary = primaryAction;
  } else if (deckId && newCount > 0) {
    primary = {
      label: t('Ещё {{count}} новых из «{{deck}}»', { count: newCount, deck: deckName ?? '' }),
      onClick: () => navigate(RoutePath.LEARN(deckId)),
      withArrow: true,
    };
  }

  const streakMeta = [
    dayAdded ? '+1' : null,
    // Мобильный макет: «+1 · до рекорда N» — уровень и так виден по цвету огня
    isMobile ? null : t('уровень «{{level}}»', { level: t(STREAK_LEVEL_NAMES[level.index]) }),
    longest > streak ? t('до рекорда {{count}}', { count: longest }) : null,
  ].filter(Boolean).join(' · ');

  const stats = [
    { label: t('Карточек'), value: summary.cards },
    {
      label: t('Точность'),
      value: trackAccuracy ? `${summary.accuracy}%` : '—',
      success: trackAccuracy,
      tag: isRecord ? t('Личный рекорд') : null,
    },
    { label: t('Время'), value: formatDuration(summary.durationMs) },
    {
      label: t('Усвоено'),
      value: summary.mastered === null ? '—' : `+${summary.mastered}`,
      success: summary.mastered !== null,
    },
  ];

  return (
    <div className={classNames(cls.SessionResult, [className])}>
      <div className={cls.content}>
        <div className={cls.head}>
          <Kicker tone={KickerTone.ACCENT} className={cls.kicker}>{t('Сессия завершена')}</Kicker>
          <h1 className={cls.title}>
            {due?.count === 0 ? t('Долг закрыт. День засчитан.') : t('День засчитан.')}
          </h1>
        </div>

        <div className={cls.grid}>
          <AccentPanel className={classNames(cls.streak, [LEVEL_CLASSES[level.index]])}>
            <div className={cls.streakRow}>
              <motion.span
                className={cls.flame}
                animate={{ scale: streakShown ? [1, levelUp ? FLAME_LEVEL_UP_PULSE : FLAME_PULSE, 1] : 1 }}
                transition={DELIBERATE}
              >
                <Flame
                  size={isMobile ? MOBILE_FLAME_SIZE : FLAME_SIZE}
                  strokeWidth={FLAME_STROKE}
                  aria-hidden
                />
              </motion.span>
              <span className={cls.streakDays} aria-label={String(streak)}>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={shownStreak}
                    aria-hidden
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={DELIBERATE}
                  >
                    {shownStreak}
                  </motion.span>
                </AnimatePresence>
              </span>
              <div className={cls.streakText}>
                <span className={cls.streakUnit}>
                  {t('дней подряд', { count: streak })}
                </span>
                <span className={cls.streakMeta}>{streakMeta}</span>
              </div>
            </div>
            <div className={cls.week}>
              {week.map((day, i) => (
                <div key={day.key} className={cls.day}>
                  <div
                    className={classNames(cls.dayCell, {
                      [cls.dayActive]: day.active,
                      [cls.dayToday]: i === week.length - 1,
                    })}
                  />
                  <span className={cls.dayLabel}>{day.label}</span>
                </div>
              ))}
            </div>
          </AccentPanel>

          <Blueprint className={cls.stats}>
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={cls.stat}
                initial={{ opacity: 0, y: reducedMotion ? 0 : STAT_SHIFT }}
                animate={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? FADE : { ...DELIBERATE, delay: (i * MOTION_MS.stagger) / SECONDS }}
              >
                <span className={cls.statLabel}>{stat.label}</span>
                <span className={classNames(cls.statValue, { [cls.success]: stat.success })}>
                  {stat.value}
                </span>
                {stat.tag && <span className={cls.tag}>{stat.tag}</span>}
              </motion.div>
            ))}
          </Blueprint>
        </div>

        {hardWords.length > 0 && !isMobile && (
          <div className={cls.hard}>
            <SectionHeader title={t('Трудные слова этой сессии')} size={SectionHeaderSize.SM} />
            <div className={cls.chips}>
              {hardWords.map((word) => (
                <span key={word.uuid} className={cls.chip}>{word.term}</span>
              ))}
            </div>
          </div>
        )}

        <div className={cls.actions}>
          <SessionButton
            className={cls.primary}
            onClick={primary.onClick}
            icon={primary.withArrow
              ? <ArrowRight size={ARROW_SIZE} strokeWidth={ICON_STROKE} />
              : undefined}
          >
            {primary.label}
          </SessionButton>
          {hardWords.length > 0 && (
            <SessionButton variant={SessionButtonVariant.SECONDARY} onClick={repeatHard}>
              {isMobile
                ? t('Повторить трудные · {{count}}', { count: hardWords.length })
                : t('Повторить трудные')}
            </SessionButton>
          )}
          {/* На мобильном выход — ✕ в топбаре */}
          {!isMobile && (
            <SessionButton variant={SessionButtonVariant.GHOST} onClick={() => navigate(RoutePath.MAIN())}>
              {t('На главную')}
            </SessionButton>
          )}
        </div>
      </div>
    </div>
  );
};
