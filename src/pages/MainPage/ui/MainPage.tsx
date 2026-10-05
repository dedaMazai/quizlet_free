import {
    FC, useEffect, useMemo, useRef, useState,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input, InputRef, Segmented } from 'antd';
import { ArrowRight, Search } from 'lucide-react';
import { DeckCard, useGetDecksQuery } from '@/entities/Deck';
import { useGetCardsPageQuery } from '@/entities/Card';
import {
    useGetDueSummaryQuery, useGetMasteryQuery, useTodayAnswers,
} from '@/entities/Statistics';
import { useUserInfo } from '@/entities/User';
import { useDailyGoal } from '@/entities/UserSettings';
import { DueHero } from '@/widgets/DueHero';
import { NextSteps } from '@/widgets/NextSteps';
import { StreakCard } from '@/widgets/StreakCard';
import { Kicker } from '@/shared/ui/Kicker';
import { SectionHeader, SectionHeaderSize } from '@/shared/ui/SectionHeader';
import { RoutePath } from '@/shared/config/router/routePath';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';
import { FocusSearchLocationState } from '@/shared/const/const';
import { GlobalSearchResults } from './GlobalSearchResults';
import cls from './MainPage.module.scss';

type DeckFilter = 'recent' | 'own' | 'shared';

const DECKS_LIMIT = 4;
const ARROW_SIZE = 14;
const ICON_STROKE = 1.5;
const SEARCH_ICON_SIZE = 16;
const PERCENT = 100;

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
    const location = useLocation();
    const userInfo = useUserInfo();
    const searchRef = useRef<InputRef>(null);

    const tz = useMemo(
        () => userInfo?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        [userInfo?.timezone],
    );

    const { data: decks } = useGetDecksQuery();
    const { data: summary } = useGetDueSummaryQuery(tz);
    const { data: mastery } = useGetMasteryQuery();
    const todayAnswers = useTodayAnswers(tz);
    const goal = useDailyGoal();

    const [search, debouncedSearch, , setSearchDebounced] = useDebounceState('');
    const [filter, setFilter] = useState<DeckFilter>('recent');

    // Кнопка поиска в Topbar ведёт сюда с фокусом в поле (до палитры ⌘K)
    useEffect(() => {
        if ((location.state as FocusSearchLocationState | null)?.focusSearch) {
            searchRef.current?.focus();
        }
    }, [location.key, location.state]);

    const hasSearch = Boolean(debouncedSearch.trim());
    const { data: searchResults } = useGetCardsPageQuery(
        { page: 1, pageSize: 20, search: debouncedSearch.trim() },
        { skip: !hasSearch },
    );

    const name = userInfo?.name ?? '';
    const now = new Date();
    const greeting = t(getGreetingKey(now.getHours()));
    const dateKicker = [
        new Intl.DateTimeFormat(i18n.language, { weekday: 'long', timeZone: tz }).format(now),
        new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', timeZone: tz }).format(now),
    ].join(' · ');

    const deckList = useMemo(() => decks ?? [], [decks]);

    const deckNameByUuid = useMemo(() => {
        const map: Record<string, string> = {};
        deckList.forEach((deck) => {
            map[deck.uuid] = deck.name;
        });
        return map;
    }, [deckList]);

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

    return (
        <div className={cls.MainPage}>
            <Input
                ref={searchRef}
                className={cls.search}
                allowClear
                prefix={<Search aria-hidden size={SEARCH_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                value={search}
                placeholder={t('Найти колоды и слова')}
                onChange={(e) => setSearchDebounced(e.target.value)}
            />

            {hasSearch ? (
                <GlobalSearchResults
                    query={debouncedSearch}
                    decks={deckList}
                    cards={searchResults?.cards ?? []}
                    deckNameByUuid={deckNameByUuid}
                />
            ) : (
                <>
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
                        <div className={cls.deckGrid}>
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
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default MainPage;
