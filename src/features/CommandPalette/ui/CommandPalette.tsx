import {
    Fragment, KeyboardEvent, memo, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Modal } from 'antd';
import { Search } from 'lucide-react';
import { KeyHint } from '@/shared/ui/KeyHint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useDebounceState } from '@/shared/lib/hooks/useDebounceState';
import { CommandGroup, CommandItem } from '../model/types';
import { useCommandItems } from '../model/useCommandItems';
import cls from './CommandPalette.module.scss';

const PALETTE_WIDTH = 640;
const SEARCH_DEBOUNCE_MS = 200;
const SEARCH_ICON_SIZE = 18;
const ROW_ICON_SIZE = 16;
const ICON_STROKE = 1.5;

interface CommandPaletteProps {
    open: boolean;
    onClose: () => void;
    onCreateDeck: () => void;
    onAddWords: (deckUuid: string) => void;
}

/** Палитра ⌘K: действия, колоды, слова, переходы; ↑↓ Enter Esc (BACKLOG §4) */
export const CommandPalette = memo((props: CommandPaletteProps) => {
    const {
        open, onClose, onCreateDeck, onAddWords,
    } = props;
    const { t } = useTranslation();
    const [query, debouncedQuery, resetQuery, setQuery] = useDebounceState('', SEARCH_DEBOUNCE_MS);
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    const items = useCommandItems({
        open, query, debouncedQuery, onCreateDeck, onAddWords,
    });

    const groupTitles: Record<CommandGroup, string> = {
        [CommandGroup.ACTIONS]: t('Действия'),
        [CommandGroup.DECKS]: query.trim() ? t('Колоды') : t('Недавние колоды'),
        [CommandGroup.WORDS]: t('Слова'),
        [CommandGroup.GOTO]: t('Перейти'),
    };

    // Новый запрос или пришли слова — выделение на первую строку
    useEffect(() => setActiveIndex(0), [query, items.length]);

    useEffect(() => {
        if (!open) resetQuery('');
    }, [open, resetQuery]);

    useEffect(() => {
        listRef.current
            ?.querySelector(`[data-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    const runItem = (item: CommandItem | undefined) => {
        if (!item) return;
        onClose();
        item.run();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!items.length) return;
            const step = e.key === 'ArrowDown' ? 1 : -1;
            setActiveIndex((prev) => (prev + step + items.length) % items.length);
        } else if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            runItem(items[activeIndex]);
        }
    };

    return (
        <Modal
            open={open}
            width={PALETTE_WIDTH}
            title={null}
            footer={null}
            closable={false}
            destroyOnHidden
            onCancel={onClose}
            rootClassName={cls.root}
            classNames={{ container: cls.container, body: cls.body }}
        >
            <Input
                autoFocus
                variant="borderless"
                className={cls.input}
                prefix={<Search aria-hidden size={SEARCH_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                placeholder={t('Поиск колод, слов и разделов')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label={t('Поиск колод, слов и разделов')}
            />
            <div ref={listRef} className={cls.list} role="listbox">
                {items.length === 0 && <div className={cls.empty}>{t('Ничего не найдено')}</div>}
                {items.map((item, index) => {
                    const isActive = index === activeIndex;
                    const Icon = item.icon;
                    return (
                        <Fragment key={item.id}>
                            {item.group !== items[index - 1]?.group && (
                                <Kicker size={KickerSize.SM} className={cls.groupTitle}>
                                    {groupTitles[item.group]}
                                </Kicker>
                            )}
                            <div
                                role="option"
                                aria-selected={isActive}
                                data-index={index}
                                className={classNames(cls.row, { [cls.active]: isActive })}
                                onMouseMove={() => setActiveIndex(index)}
                                onClick={() => runItem(item)}
                            >
                                <Icon aria-hidden className={cls.icon} size={ROW_ICON_SIZE} strokeWidth={ICON_STROKE} />
                                <span className={cls.text}>
                                    <span className={cls.title}>{item.title}</span>
                                    {item.subtitle && <span className={cls.subtitle}>{item.subtitle}</span>}
                                </span>
                                {item.meta && <span className={cls.meta}>{item.meta}</span>}
                                <KeyHint className={classNames(cls.enter, { [cls.enterVisible]: isActive })}>
                                    ↵
                                </KeyHint>
                            </div>
                        </Fragment>
                    );
                })}
            </div>
            <div className={cls.footer}>
                <KeyHint>{t('↑↓ выбрать')}</KeyHint>
                <KeyHint>{t('↵ открыть')}</KeyHint>
                <KeyHint>{t('Esc закрыть')}</KeyHint>
            </div>
        </Modal>
    );
});

CommandPalette.displayName = 'CommandPalette';
