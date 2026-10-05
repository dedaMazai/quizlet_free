import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap, Layers, Plus, Repeat, Settings, SquarePen, Type, UserRound,
} from 'lucide-react';
import { getRecentDeckUuids, useGetDecksQuery } from '@/entities/Deck';
import type { Deck } from '@/entities/Deck';
import { useGetCardsPageQuery, useGetDueCountQuery } from '@/entities/Card';
import { selectLearnDeckUuid, useGetDueSummaryQuery } from '@/entities/Statistics';
import { useUserInfo } from '@/entities/User';
import { RoutePath } from '@/shared/config/router/routePath';
import { ReviewLocationState } from '@/shared/const/const';
import { getNavSections } from '@/shared/const/menu';
import { CommandGroup, CommandItem } from './types';

const RECENT_DECKS_LIMIT = 5;
const DECKS_LIMIT = 6;
const WORDS_LIMIT = 8;

interface UseCommandItemsArgs {
    open: boolean;
    /** Мгновенное значение поля — для локального фильтра */
    query: string;
    /** С задержкой 200 мс — для серверного поиска по словам */
    debouncedQuery: string;
    onCreateDeck: () => void;
    onAddWords: (deckUuid: string) => void;
}

const includes = (text: string | undefined, needle: string): boolean => (
    text?.toLowerCase().includes(needle) ?? false
);

const labelText = (label: ReactNode): string => (typeof label === 'string' ? label : '');

const byUpdatedDesc = (a: Deck, b: Deck) => b.updated_at.localeCompare(a.updated_at);

/** Пустой запрос: недавно открытые колоды, дополненные недавно изменёнными */
const selectRecentDecks = (decks: Deck[]): Deck[] => {
    const byUuid = new Map(decks.map((deck) => [deck.uuid, deck]));
    const recent = getRecentDeckUuids()
        .map((uuid) => byUuid.get(uuid))
        .filter((deck): deck is Deck => Boolean(deck));
    const rest = decks.filter((deck) => !recent.includes(deck)).sort(byUpdatedDesc);
    return [...recent, ...rest].slice(0, RECENT_DECKS_LIMIT);
};

/** Последняя своя колода — куда «Добавить слова» */
const selectLastOwnDeck = (decks: Deck[]): Deck | undefined => {
    const own = decks.filter((deck) => deck.is_owner);
    const byUuid = new Map(own.map((deck) => [deck.uuid, deck]));
    const recentUuid = getRecentDeckUuids().find((uuid) => byUuid.has(uuid));
    return recentUuid ? byUuid.get(recentUuid) : [...own].sort(byUpdatedDesc)[0];
};

/** Строки палитры ⌘K по группам: Действия, Колоды, Слова, Перейти (BACKLOG §4) */
export const useCommandItems = (args: UseCommandItemsArgs): CommandItem[] => {
    const {
        open, query, debouncedQuery, onCreateDeck, onAddWords,
    } = args;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userInfo = useUserInfo();

    const tz = userInfo?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const needle = query.trim().toLowerCase();
    const search = debouncedQuery.trim();

    const { data: decks } = useGetDecksQuery(undefined, { skip: !open });
    const { data: due } = useGetDueCountQuery(undefined, { skip: !open });
    const { data: summary } = useGetDueSummaryQuery({ tz }, { skip: !open });
    const { data: cardsPage } = useGetCardsPageQuery(
        { page: 1, pageSize: WORDS_LIMIT, search },
        { skip: !open || !search },
    );

    return useMemo(() => {
        if (!open) return [];
        const deckList = decks ?? [];
        const deckNameByUuid = new Map(deckList.map((deck) => [deck.uuid, deck.name]));
        const dueCount = due?.count ?? 0;
        const lastOwnDeck = selectLastOwnDeck(deckList);
        const learnDeckUuid = selectLearnDeckUuid(summary);

        const actions: CommandItem[] = [];
        if (dueCount > 0) {
            actions.push({
                id: 'action-review',
                group: CommandGroup.ACTIONS,
                icon: Repeat,
                title: t('Повторить {{count}}', { count: dueCount }),
                run: () => {
                    const state: ReviewLocationState = { autostart: true };
                    navigate(RoutePath.REVIEW(), { state });
                },
            });
        }
        actions.push({
            id: 'action-new-deck',
            group: CommandGroup.ACTIONS,
            icon: Plus,
            title: t('Новая колода'),
            run: onCreateDeck,
        });
        if (lastOwnDeck) {
            actions.push({
                id: 'action-add-words',
                group: CommandGroup.ACTIONS,
                icon: SquarePen,
                title: t('Добавить слова в «{{name}}»', { name: lastOwnDeck.name }),
                run: () => onAddWords(lastOwnDeck.uuid),
            });
        }
        actions.push({
            id: 'action-learn-new',
            group: CommandGroup.ACTIONS,
            icon: GraduationCap,
            title: t('Учить новые'),
            run: () => navigate(learnDeckUuid ? RoutePath.LEARN(learnDeckUuid) : RoutePath.DECKS()),
        });

        const toDeckItem = (deck: Deck): CommandItem => ({
            id: `deck-${deck.uuid}`,
            group: CommandGroup.DECKS,
            icon: Layers,
            title: deck.name,
            subtitle: deck.description,
            meta: t('{{count}} слов', { count: deck.cards_count }),
            run: () => navigate(RoutePath.DECK(deck.uuid)),
        });

        if (!needle) {
            return [...actions, ...selectRecentDecks(deckList).map(toDeckItem)];
        }

        const matchedDecks = deckList
            .filter((deck) => includes(deck.name, needle) || includes(deck.description, needle))
            .slice(0, DECKS_LIMIT)
            .map(toDeckItem);

        // Серверный ответ может быть по прошлому запросу — сверяем с текущим полем
        const words: CommandItem[] = search
            ? (cardsPage?.cards ?? [])
                .filter((card) => includes(card.term, needle)
                    || includes(card.translation, needle)
                    || includes(card.example, needle))
                .map((card) => ({
                    id: `word-${card.uuid}`,
                    group: CommandGroup.WORDS,
                    icon: Type,
                    title: card.term,
                    subtitle: card.translation,
                    meta: deckNameByUuid.get(card.deck_uuid),
                    run: () => navigate(RoutePath.DECK(card.deck_uuid)),
                }))
            : [];

        const goto: CommandItem[] = getNavSections({ t }).flatMap((section) => {
            const tabs = section.tabs ?? [{ to: section.path, label: section.label }];
            return tabs.map((tab) => ({
                id: `goto-${tab.to}`,
                group: CommandGroup.GOTO,
                icon: section.Icon,
                title: labelText(tab.label),
                subtitle: section.tabs ? section.label : undefined,
                run: () => navigate(tab.to),
            }));
        });
        goto.push(
            {
                id: 'goto-profile',
                group: CommandGroup.GOTO,
                icon: UserRound,
                title: t('Профиль'),
                subtitle: t('Аккаунт'),
                run: () => navigate(RoutePath.PROFILE()),
            },
            {
                id: 'goto-settings',
                group: CommandGroup.GOTO,
                icon: Settings,
                title: t('Настройки'),
                subtitle: t('Аккаунт'),
                run: () => navigate(RoutePath.SETTINGS()),
            },
        );

        return [
            ...actions.filter((item) => includes(item.title, needle)),
            ...matchedDecks,
            ...words,
            ...goto.filter((item) => includes(item.title, needle) || includes(item.subtitle, needle)),
        ];
    }, [open, decks, due, summary, cardsPage, needle, search, t, navigate, onCreateDeck, onAddWords]);
};
