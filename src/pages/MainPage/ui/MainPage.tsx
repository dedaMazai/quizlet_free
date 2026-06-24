import { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Input, Segmented, Typography,
} from 'antd';
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useGetDecksQuery } from '@/entities/Deck';
import { useGetCardsQuery, useGetFavoritesQuery } from '@/entities/Card';
import { useUserInfo } from '@/entities/User';
import { DeckList } from '@/widgets/DeckList';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';
import { StatsStrip } from './StatsStrip';
import { QuickActions } from './QuickActions';
import { RecentWords } from './RecentWords';
import { GlobalSearchResults } from './GlobalSearchResults';
import cls from './MainPage.module.scss';

type DeckFilter = 'all' | 'own' | 'shared';

const getGreetingKey = (hour: number): string => {
    if (hour >= 5 && hour < 12) return 'Доброе утро';
    if (hour >= 12 && hour < 18) return 'Добрый день';
    if (hour >= 18 && hour < 23) return 'Добрый вечер';
    return 'Доброй ночи';
};

const MainPage: FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userInfo = useUserInfo();

    const { data: decks } = useGetDecksQuery();
    const { data: allCards } = useGetCardsQuery();
    const { data: favorites } = useGetFavoritesQuery();

    const [search, debouncedSearch, , setSearchDebounced] = useDebounceState('');
    const [filter, setFilter] = useState<DeckFilter>('all');

    const name = userInfo?.name ?? '';
    const greeting = t(getGreetingKey(new Date().getHours()));

    const deckList = useMemo(() => decks ?? [], [decks]);
    const cardList = useMemo(() => allCards ?? [], [allCards]);

    const deckNameByUuid = useMemo(() => {
        const map: Record<string, string> = {};
        deckList.forEach((deck) => {
            map[deck.uuid] = deck.name;
        });
        return map;
    }, [deckList]);

    const sharedCount = useMemo(
        () => deckList.filter((deck) => !deck.is_owner).length,
        [deckList],
    );

    const hasSearch = Boolean(debouncedSearch.trim());

    return (
        <VStack max gap="24">
            <VStack max gap="16">
                <VStack max gap="4">
                    <Typography.Title level={2} className={cls.greeting}>
                        {name
                            ? t('{{greeting}}, {{name}}! 👋', { greeting, name })
                            : t('{{greeting}}! 👋', { greeting })}
                    </Typography.Title>
                    <Typography.Paragraph type="secondary" className={cls.subtitle}>
                        {t('Создавайте колоды слов и заучивайте их в режимах «Карточки» и «Заучивание».')}
                    </Typography.Paragraph>
                </VStack>
                <Input
                    className={cls.search}
                    size="large"
                    allowClear
                    prefix={<SearchOutlined />}
                    value={search}
                    placeholder={t('Найти колоды и слова')}
                    onChange={(e) => setSearchDebounced(e.target.value)}
                />
            </VStack>

            {hasSearch ? (
                <GlobalSearchResults
                    query={debouncedSearch}
                    decks={deckList}
                    cards={cardList}
                    deckNameByUuid={deckNameByUuid}
                />
            ) : (
                <>
                    <StatsStrip
                        decksCount={deckList.length}
                        wordsCount={cardList.length}
                        favoritesCount={favorites?.length ?? 0}
                        sharedCount={sharedCount}
                    />

                    <QuickActions />

                    <VStack max gap="16">
                        <HStack max justify="between" align="center" gap="16" wrap>
                            <MyTypography.Large strong>{t('Недавние колоды')}</MyTypography.Large>
                            <HStack gap="12" align="center" wrap>
                                <Segmented<DeckFilter>
                                    value={filter}
                                    onChange={setFilter}
                                    options={[
                                        { label: t('Все'), value: 'all' },
                                        { label: t('Мои'), value: 'own' },
                                        { label: t('Доступные мне'), value: 'shared' },
                                    ]}
                                />
                                <Typography.Link onClick={() => navigate(RoutePath.DECKS())}>
                                    {t('Все колоды')} <ArrowRightOutlined />
                                </Typography.Link>
                            </HStack>
                        </HStack>
                        <DeckList
                            limit={6}
                            sort="recent"
                            filter={filter}
                            showFavorites={false}
                        />
                    </VStack>

                    <VStack max gap="16">
                        <MyTypography.Large strong>
                            {t('Недавно добавленные слова')}
                        </MyTypography.Large>
                        <RecentWords cards={cardList} deckNameByUuid={deckNameByUuid} />
                    </VStack>
                </>
            )}
        </VStack>
    );
};

export default MainPage;
