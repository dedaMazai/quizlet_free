import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Empty, Tag } from 'antd';
import type { Card as CardEntity } from '@/entities/Card';
import { FavoriteToggle } from '@/entities/Card';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { RoutePath } from '@/shared/config/router/routePath';
import cls from './RecentWords.module.scss';

interface RecentWordsProps {
    cards: CardEntity[];
    deckNameByUuid: Record<string, string>;
    limit?: number;
}

export const RecentWords: FC<RecentWordsProps> = (props) => {
    const { cards, deckNameByUuid, limit = 6 } = props;
    const { t } = useTranslation();
    const navigate = useNavigate();

    const recent = useMemo(
        () => [...cards]
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, limit),
        [cards, limit],
    );

    return (
        <Card variant="borderless" className={cls.container}>
            {recent.length === 0 ? (
                <Empty description={t('Здесь появятся недавно добавленные слова')} />
            ) : (
                <VStack max gap="4">
                    {recent.map((card) => (
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
                                        {deckNameByUuid[card.deck_uuid]}
                                    </Tag>
                                )}
                                <SpeakButton text={card.term} />
                                <FavoriteToggle cardUuid={card.uuid} />
                            </HStack>
                        </HStack>
                    ))}
                </VStack>
            )}
        </Card>
    );
};
