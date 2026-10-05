import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Deck, useCreateDeckMutation, useGetDecksQuery } from '@/entities/Deck';
import { useCreateCardsMutation } from '@/entities/Card';
import { VerbBand, verbToTerm } from '@/shared/const/grammar';
import { useToast } from '@/shared/lib/toast';

export const useImportVerbsDeck = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const { data: decks } = useGetDecksQuery();
    const [createDeck] = useCreateDeckMutation();
    const [createCards] = useCreateCardsMutation();
    const [importingBand, setImportingBand] = useState<number | null>(null);

    const getBandDeckName = (band: VerbBand): string => (
        t('Неправильные глаголы {{from}}–{{to}}', { from: band.from, to: band.to })
    );

    const findExistingDeck = (band: VerbBand): Deck | undefined => (
        decks?.find((deck) => deck.name === getBandDeckName(band))
    );

    /** Создаёт колоду группы глаголов; при ошибке показывает тост и возвращает undefined */
    const importBand = async (band: VerbBand): Promise<Deck | undefined> => {
        setImportingBand(band.index);
        try {
            const deck = await createDeck({
                name: getBandDeckName(band),
                description: t('Формы неправильных глаголов: базовая, прошедшее время и причастие.'),
            }).unwrap();
            // card_type задаётся явно: иначе термин из трёх форм классифицируется как фраза.
            await createCards(band.verbs.map((verb) => ({
                deck_uuid: deck.uuid,
                term: verbToTerm(verb),
                translation: verb.translation,
                card_type: 'word' as const,
            }))).unwrap();
            toast.success(t('Колода создана'));
            return deck;
        } catch {
            toast.error(t('Не удалось создать колоду'));
            return undefined;
        } finally {
            setImportingBand(null);
        }
    };

    return {
        importBand, importingBand, findExistingDeck,
    };
};
