import {
    CSSProperties, FC, useMemo, useState,
} from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Segmented } from 'antd';
import { ArrowRight, Flame, Layers } from 'lucide-react';
import { DeckCard, DeckCardSkeleton, useGetDecksQuery } from '@/entities/Deck';
import {
    useGetDueSummaryQuery, useGetMasteryQuery, useGetStudyOverviewQuery, useTodayAnswers,
} from '@/entities/Statistics';
import { UserAvatar, useUserInfo } from '@/entities/User';
import { useDailyGoal } from '@/entities/UserSettings';
import { CardEditor } from '@/features/CardEditor';
import { DeckForm } from '@/features/DeckForm';
import { DueHero } from '@/widgets/DueHero';
import { NextSteps } from '@/widgets/NextSteps';
import { StreakCard } from '@/widgets/StreakCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { FadeIn } from '@/shared/ui/Skeleton';
import { SectionHeader, SectionHeaderSize } from '@/shared/ui/SectionHeader';
import { RoutePath } from '@/shared/config/router/routePath';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { getStreakLevel } from '@/shared/lib/streak';
import cls from './MainPage.module.scss';

type DeckFilter = 'recent' | 'own' | 'shared';

const DECKS_LIMIT = 4;
const ARROW_SIZE = 14;
const ICON_STROKE = 1.5;
const PERCENT = 100;
const FLAME_SIZE = 18;
const STREAK_LEVEL_CLASSES = [cls.streak0, cls.streak1, cls.streak2, cls.streak3, cls.streak4];

const getGreetingKey = (hour: number): string => {
    if (hour >= 5 && hour < 12) return 'Доброе утро';
    if (hour >= 12 && hour < 18) return 'Добрый день';
    if (hour >= 18 && hour < 23) return 'Добрый вечер';
    return 'Доброй ночи';
};

const toPercent = (part: number, total: number): number => (
    total > 0 ? Math.round((part / total) * PERCENT) : 0
);

const MainPage: FC = () => {
    const { t, i18n } = useTranslation();
    const userInfo = useUserInfo();
    const { isMobile } = useMatchMedia();

    const tz = useMemo(
        () => userInfo?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        [userInfo?.timezone],
    );

    const { data: decks, isLoading: isDecksLoading } = useGetDecksQuery();
    // Долг и освоение по колодам нужны только сетке колод — на мобильной её нет
    const { data: summary } = useGetDueSummaryQuery({ tz }, { skip: isMobile });
    const { data: mastery } = useGetMasteryQuery(undefined, { skip: isMobile });
    const todayAnswers = useTodayAnswers(tz);
    const goal = useDailyGoal();
    // Серия на мобильной — только чипом в шапке (StreakCard скрыт)
    const { data: overview } = useGetStudyOverviewQuery({ tz }, { skip: !isMobile });

    const [filter, setFilter] = useState<DeckFilter>('recent');
    // Пустая главная: «Создать колоду» / «Импорт из Excel» (DeckForm → CardEditor новой колоды)
    const [deckFormOpen, setDeckFormOpen] = useState(false);
    const [importAfterCreate, setImportAfterCreate] = useState(false);
    const [importDeckUuid, setImportDeckUuid] = useState<string>();

    const name = userInfo?.name ?? '';
    const now = new Date();
    const greeting = t(getGreetingKey(now.getHours()));
    const dateKicker = [
        new Intl.DateTimeFormat(i18n.language, { weekday: 'long', timeZone: tz }).format(now),
        new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', timeZone: tz }).format(now),
    ].join(' · ');
    // Мобильная: «ПН · 5 ОКТЯБРЯ» — день недели кратко
    const dateKickerShort = [
        new Intl.DateTimeFormat(i18n.language, { weekday: 'short', timeZone: tz }).format(now),
        new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', timeZone: tz }).format(now),
    ].join(' · ');

    const deckList = useMemo(() => decks ?? [], [decks]);

    const visibleDecks = useMemo(() => {
        let list = deckList;
        if (filter === 'own') list = list.filter((deck) => deck.is_owner);
        if (filter === 'shared') list = list.filter((deck) => !deck.is_owner);
        return [...list]
            .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
            .slice(0, DECKS_LIMIT);
    }, [deckList, filter]);

    const dueByDeck = useMemo(
        () => new Map((summary?.perDeck ?? []).map((deck) => [deck.deckUuid, deck.due])),
        [summary],
    );
    const masteryByDeck = useMemo(
        () => new Map((mastery?.perDeck ?? []).map((deck) => [deck.deckKey, deck])),
        [mastery],
    );

    // Только по успешному ответу: при ошибке запроса колоды могут быть, просто не загрузились
    const hasNoDecks = decks?.length === 0;

    const openDeckForm = (withImport: boolean) => {
        setImportAfterCreate(withImport);
        setDeckFormOpen(true);
    };

    const noDecksState = (
        <EmptyState
            icon={Layers}
            kicker={t('Начало')}
            title={t('Создайте первую колоду')}
            description={t('Колода — набор слов с переводами, из неё строятся все режимы.')}
            primary={{ label: t('Создать колоду'), onClick: () => openDeckForm(false) }}
            secondary={{ label: t('Импорт из Excel'), onClick: () => openDeckForm(true) }}
        />
    );

    const deckModals = (
        <>
            <DeckForm
                open={deckFormOpen}
                onClose={() => setDeckFormOpen(false)}
                onCreated={(deck) => {
                    if (importAfterCreate) setImportDeckUuid(deck.uuid);
                }}
            />
            {importDeckUuid && (
                <CardEditor
                    open
                    openFilePicker
                    deckUuid={importDeckUuid}
                    onClose={() => setImportDeckUuid(undefined)}
                />
            )}
        </>
    );

    // Мобильная главная (6.35): шапка с серией и аватаром, hero, цель дня, следующий шаг
    if (isMobile) {
        const streakDays = overview?.currentStreak ?? 0;
        const goalStyle = {
            '--progress': `${Math.min(PERCENT, toPercent(todayAnswers, goal))}%`,
        } as CSSProperties;

        return (
            <div className={cls.MainPage}>
                <header className={cls.header}>
                    <div className={cls.greeting}>
                        <Kicker size={KickerSize.SM}>{dateKickerShort}</Kicker>
                        <h1 className={cls.title}>{greeting}</h1>
                    </div>
                    <div className={cls.headerActions}>
                        <span className={cls.streakChip}>
                            <Flame
                                aria-hidden
                                className={STREAK_LEVEL_CLASSES[getStreakLevel(streakDays).index]}
                                size={FLAME_SIZE}
                            />
                            <span className={cls.streakDays}>{streakDays}</span>
                        </span>
                        <Link to={RoutePath.PROFILE()} aria-label={t('Аккаунт')} className={cls.avatarLink}>
                            <UserAvatar user={userInfo} className={cls.avatar} />
                        </Link>
                    </div>
                </header>

                {hasNoDecks ? noDecksState : (
                    <>
                        <DueHero tz={tz} />

                        <div className={cls.dailyGoal}>
                            <div className={cls.dailyGoalHead}>
                                <span>{t('Цель дня')}</span>
                                <span className={cls.dailyGoalValue}>{`${todayAnswers} / ${goal}`}</span>
                            </div>
                            <div className={cls.dailyGoalTrack} style={goalStyle}>
                                <div className={cls.dailyGoalFill} />
                            </div>
                        </div>

                        <NextSteps tz={tz} />
                    </>
                )}
                {deckModals}
            </div>
        );
    }

    return (
        <div className={cls.MainPage}>
            <header className={cls.header}>
                <div className={cls.greeting}>
                    <Kicker>{dateKicker}</Kicker>
                    <h1 className={cls.title}>
                        {name
                            ? t('{{greeting}}, {{name}}', { greeting, name })
                            : greeting}
                    </h1>
                </div>
                <div className={cls.goal}>
                    <span className={cls.goalLabel}>{t('Цель дня')}</span>
                    <span className={cls.goalValue}>{`${todayAnswers} / ${goal}`}</span>
                </div>
            </header>

            {hasNoDecks ? noDecksState : (
                <>
                    <div className={cls.overview}>
                        <DueHero tz={tz} />
                        <StreakCard tz={tz} />
                    </div>

                    <NextSteps tz={tz} />

                    <section className={cls.decks}>
                        <SectionHeader
                            className={cls.decksHeader}
                            size={SectionHeaderSize.LG}
                            title={t('Колоды')}
                            titleExtra={(
                                <Segmented<DeckFilter>
                                    className={cls.filter}
                                    classNames={{ item: cls.filterItem, label: cls.filterLabel }}
                                    value={filter}
                                    onChange={setFilter}
                                    options={[
                                        { label: t('Недавние'), value: 'recent' },
                                        { label: t('Мои'), value: 'own' },
                                        { label: t('Общие'), value: 'shared' },
                                    ]}
                                />
                            )}
                            extra={(
                                <Link to={RoutePath.DECKS()} className={cls.allDecks}>
                                    {t('Все {{count}} колод', { count: deckList.length })}
                                    <ArrowRight aria-hidden size={ARROW_SIZE} strokeWidth={ICON_STROKE} />
                                </Link>
                            )}
                        />
                        {isDecksLoading ? (
                            <div className={cls.deckGrid}>
                                {Array.from({ length: DECKS_LIMIT }, (_, i) => <DeckCardSkeleton key={i} />)}
                            </div>
                        ) : (
                            <FadeIn className={cls.deckGrid}>
                                {visibleDecks.map((deck) => {
                                    const deckMastery = masteryByDeck.get(deck.uuid);
                                    return (
                                        <DeckCard
                                            key={deck.uuid}
                                            deck={deck}
                                            dueCount={dueByDeck.get(deck.uuid) ?? 0}
                                            mastered={toPercent(deckMastery?.mastered ?? 0, deck.cards_count)}
                                            learning={toPercent(deckMastery?.learning ?? 0, deck.cards_count)}
                                        />
                                    );
                                })}
                            </FadeIn>
                        )}
                    </section>
                </>
            )}
            {deckModals}
        </div>
    );
};

export default MainPage;
