import { useMemo } from 'react';
import { useLocation } from 'react-router';

/** state маршрута сессии: «Повторить трудные» запускает ту же сессию по части карточек */
export interface SessionRouteState {
    cardUuids?: string[];
}

/** Оставляет карточки из `location.state.cardUuids`; без state — все */
export const useSessionCardFilter = <T extends { uuid: string }>(cards: T[] | undefined) => {
    const location = useLocation();
    const uuids = (location.state as SessionRouteState | null)?.cardUuids;

    const filtered = useMemo(() => {
        if (!cards || !uuids?.length) return cards;
        const set = new Set(uuids);
        return cards.filter((card) => set.has(card.uuid));
    }, [cards, uuids]);

    // key для сессии: новый запуск с тем же URL должен пересоздать её
    return { cards: filtered, sessionKey: location.key };
};
