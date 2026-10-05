import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Blueprint } from '@/shared/ui/Blueprint';
import { DueBadge } from '@/shared/ui/DueBadge';
import { MasteryBar, MasteryBarSize } from '@/shared/ui/MasteryBar';
import { RoutePath } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Deck } from '../../model/types/deck';
import cls from './DeckCard.module.scss';

interface DeckCardProps {
    deck: Deck;
    /** Слов к повторению */
    dueCount: number;
    /** Доля «усвоено», 0–100 */
    mastered: number;
    /** Доля «изучаю», 0–100 */
    learning: number;
    className?: string;
}

/** Карточка колоды: название, бейдж долга, полоса освоения (Home 6.1) */
export const DeckCard = memo((props: DeckCardProps) => {
    const {
        deck, dueCount, mastered, learning, className,
    } = props;
    const { t } = useTranslation();

    return (
        <Link to={RoutePath.DECK(deck.uuid)} className={classNames(cls.DeckCard, [className])}>
            <Blueprint className={cls.card}>
                <div className={cls.head}>
                    <span className={cls.name}>{deck.name}</span>
                    <DueBadge count={dueCount} className={cls.badge} />
                </div>
                <div className={cls.progress}>
                    <MasteryBar mastered={mastered} learning={learning} size={MasteryBarSize.MD} />
                    <div className={cls.stats}>
                        <span>{t('{{count}} слов', { count: deck.cards_count })}</span>
                        <span>{t('{{percent}}% усвоено', { percent: mastered })}</span>
                    </div>
                </div>
            </Blueprint>
        </Link>
    );
});

DeckCard.displayName = 'DeckCard';
