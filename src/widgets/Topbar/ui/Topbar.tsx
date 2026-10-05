import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { Plus, Search } from 'lucide-react';
import { CardEditor } from '@/features/CardEditor';
import { CommandPalette, useCommandHotkeys } from '@/features/CommandPalette';
import { DeckForm } from '@/features/DeckForm';
import { UserNotification } from '@/entities/Notifications/ui/UserNotification';
import cls from './Topbar.module.scss';

const SEARCH_HOTKEY_LABEL = '⌘K';

/** Шапка приложения: поиск «⌘K» (палитра), «+ Колода», уведомления (Shell 6.1) */
export const Topbar = memo(() => {
    const { t } = useTranslation();
    const [deckFormOpen, setDeckFormOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [addWordsDeckUuid, setAddWordsDeckUuid] = useState<string>();

    useCommandHotkeys(paletteOpen, setPaletteOpen);

    const openPalette = useCallback(() => setPaletteOpen(true), []);
    const closePalette = useCallback(() => setPaletteOpen(false), []);
    const openDeckForm = useCallback(() => setDeckFormOpen(true), []);
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
            <DeckForm open={deckFormOpen} onClose={closeDeckForm} />
            <CommandPalette
                open={paletteOpen}
                onClose={closePalette}
                onCreateDeck={openDeckForm}
                onAddWords={setAddWordsDeckUuid}
            />
            {addWordsDeckUuid && (
                <CardEditor open deckUuid={addWordsDeckUuid} onClose={closeCardEditor} />
            )}
        </header>
    );
});

Topbar.displayName = 'Topbar';
