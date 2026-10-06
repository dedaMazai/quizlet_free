import {
    lazy, memo, Suspense, useCallback, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { Plus, Search } from 'lucide-react';
import { CommandPalette, useCommandHotkeys } from '@/features/CommandPalette';
import { UserNotification } from '@/entities/Notifications/ui/UserNotification';
import cls from './Topbar.module.scss';

const SEARCH_HOTKEY_LABEL = '⌘K';

// Формы открываются по клику — их код (и зависимости) не нужен для первой отрисовки кабинета
const DeckForm = lazy(() => import('@/features/DeckForm').then((m) => ({ default: m.DeckForm })));
const CardEditor = lazy(() => import('@/features/CardEditor').then((m) => ({ default: m.CardEditor })));

/** Шапка приложения: поиск «⌘K» (палитра), «+ Колода», уведомления (Shell 6.1) */
export const Topbar = memo(() => {
    const { t } = useTranslation();
    const [deckFormOpen, setDeckFormOpen] = useState(false);
    // Форма остаётся смонтированной после первого открытия — чтобы работала анимация закрытия
    const [deckFormMounted, setDeckFormMounted] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [addWordsDeckUuid, setAddWordsDeckUuid] = useState<string>();

    useCommandHotkeys(paletteOpen, setPaletteOpen);

    const openPalette = useCallback(() => setPaletteOpen(true), []);
    const closePalette = useCallback(() => setPaletteOpen(false), []);
    const openDeckForm = useCallback(() => {
        setDeckFormMounted(true);
        setDeckFormOpen(true);
    }, []);
    const closeDeckForm = useCallback(() => setDeckFormOpen(false), []);
    const closeCardEditor = useCallback(() => setAddWordsDeckUuid(undefined), []);

    return (
        <header className={cls.Topbar}>
            <button type="button" className={cls.search} onClick={openPalette}>
                <Search size={16} strokeWidth={1.5} />
                <span className={cls.searchText}>{t('Поиск по колодам и словам')}</span>
                <kbd className={cls.kbd}>{SEARCH_HOTKEY_LABEL}</kbd>
            </button>
            <div className={cls.actions}>
                <Button
                    className={cls.deckBtn}
                    icon={<Plus size={16} strokeWidth={1.5} />}
                    onClick={openDeckForm}
                >
                    {t('Колода')}
                </Button>
                <UserNotification />
            </div>
            <Suspense fallback={null}>
                {deckFormMounted && <DeckForm open={deckFormOpen} onClose={closeDeckForm} />}
                {addWordsDeckUuid && (
                    <CardEditor open deckUuid={addWordsDeckUuid} onClose={closeCardEditor} />
                )}
            </Suspense>
            <CommandPalette
                open={paletteOpen}
                onClose={closePalette}
                onCreateDeck={openDeckForm}
                onAddWords={setAddWordsDeckUuid}
            />
        </header>
    );
});

Topbar.displayName = 'Topbar';
