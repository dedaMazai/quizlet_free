import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Empty, Tag } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import type { Deck } from '@/entities/Deck';
import type { Card as CardEntity } from '@/entities/Card';
import { FavoriteToggle } from '@/entities/Card';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './GlobalSearchResults.module.scss';

interface GlobalSearchResultsProps {
    query: string;
    decks: Deck[];
    cards: CardEntity[];
    deckNameByUuid: Record<string, string>;
    limit?: number;
}

export const GlobalSearchResults: FC<GlobalSearchResultsProps> = (props) => {
    const {
        query, decks, cards, deckNameByUuid, limit = 20,
    } = props;
    const { t } = useTranslation();
    const navigate = useNavigate();

    const normalized = query.trim().toLowerCase();

    const matchedDecks = useMemo(
        () => decks.filter((deck) => deck.name.toLowerCase().includes(normalized)
            || (deck.description?.toLowerCase().includes(normalized) ?? false)),
        [decks, normalized],
    );

    const matchedCards = useMemo(
        () => cards
            .filter((card) => card.term.toLowerCase().includes(normalized)
                || card.translation.toLowerCase().includes(normalized)
                || (card.example?.toLowerCase().includes(normalized) ?? false))
            .slice(0, limit),
        [cards, normalized, limit],
    );

    if (!matchedDecks.length && !matchedCards.length) {
        return (
            <Card variant="borderless" className={cls.container}>
                <Empty description={t('Ничего не найдено')} />
            </Card>
        );
    }

    return (
        <VStack max gap="16">
            {matchedDecks.length > 0 && (
                <Card variant="borderless" className={cls.container}>
                    <VStack max gap="8">
                        <MyTypography.Small type="secondary">{t('Колоды')}</MyTypography.Small>
                        {matchedDecks.map((deck) => (
                            <HStack
                                key={deck.uuid}
                                max
                                gap="12"
                                align="center"
                                className={cls.row}
                                onClick={() => navigate(RoutePath.DECK(deck.uuid))}
                            >
                                <div className={cls.iconBox}><AppstoreOutlined /></div>
                                <VStack className={cls.word}>
                                    <MyTypography.Base strong>{deck.name}</MyTypography.Base>
                                    {deck.description && (
                                        <MyTypography.Small type="secondary">
                                            {deck.description}
                                        </MyTypography.Small>
                                    )}
                                </VStack>
                            </HStack>
                        ))}
                    </VStack>
                </Card>
            )}

            {matchedCards.length > 0 && (
                <Card variant="borderless" className={cls.container}>
                    <VStack max gap="8">
                        <MyTypography.Small type="secondary">{t('Слова')}</MyTypography.Small>
                        {matchedCards.map((card) => (
                            <HStack
                                key={card.uuid}
                                max
                                gap="12"
                                align="center"
                                justify="between"
                                className={cls.row}
                                onClick={() => navigate(RoutePath.DECK(card.deck_uuid))}
                            >
                                <HStack gap="8" align="center" className={cls.word}>
                                    <MyTypography.Base strong>{card.term}</MyTypography.Base>
                                    <span className={cls.arrow}>→</span>
                                    <MyTypography.Base type="secondary">
                                        {card.translation}
                                    </MyTypography.Base>
                                </HStack>
                                <HStack gap="4" align="center">
                                    {deckNameByUuid[card.deck_uuid] && (
                                        <Tag bordered={false} className={cls.deckTag}>
                                            {t('в колоде {{name}}', {
                                                name: deckNameByUuid[card.deck_uuid],
                                            })}
                                        </Tag>
                                    )}
                                    <SpeakButton text={card.term} />
                                    <FavoriteToggle cardUuid={card.uuid} />
                                </HStack>
                            </HStack>
                        ))}
                    </VStack>
                </Card>
            )}
        </VStack>
    );
};
