import {
    memo, useCallback, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from 'antd';
import { Plus, Search } from 'lucide-react';
import { DeckForm } from '@/features/DeckForm';
import { UserNotification } from '@/entities/Notifications/ui/UserNotification';
import { RoutePath } from '@/shared/config/router/routePath';
import { FocusSearchLocationState } from '@/shared/const/const';
import cls from './Topbar.module.scss';

const SEARCH_HOTKEY_LABEL = '⌘K';

/** Фокус в поле ввода или открыта модалка — ⌘K не должен уводить со страницы */
const shouldIgnoreHotkey = (target: EventTarget | null): boolean => {
    const hasOpenModal = Array.from(document.querySelectorAll('.ant-modal-wrap'))
        .some((wrap) => getComputedStyle(wrap).display !== 'none');
    if (hasOpenModal) {
        return true;
    }
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

/** Шапка приложения: поиск «⌘K», «+ Колода», уведомления (Shell 6.1) */
export const Topbar = memo(() => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [deckFormOpen, setDeckFormOpen] = useState(false);

    // До палитры ⌘K (итерация 14) кнопка открывает поиск на главной
    const openSearch = useCallback(() => {
        const state: FocusSearchLocationState = { focusSearch: true };
        navigate(RoutePath.MAIN(), { state });
    }, [navigate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && !shouldIgnoreHotkey(e.target)) {
                e.preventDefault();
                openSearch();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [openSearch]);

    const openDeckForm = useCallback(() => setDeckFormOpen(true), []);
    const closeDeckForm = useCallback(() => setDeckFormOpen(false), []);

    return (
        <header className={cls.Topbar}>
            <button type="button" className={cls.search} onClick={openSearch}>
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
        </header>
    );
});

Topbar.displayName = 'Topbar';
