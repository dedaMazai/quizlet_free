import type { LucideIcon } from 'lucide-react';

export enum CommandGroup {
    ACTIONS = 'actions',
    DECKS = 'decks',
    WORDS = 'words',
    GOTO = 'goto',
}

export interface CommandItem {
    id: string;
    group: CommandGroup;
    icon: LucideIcon;
    title: string;
    /** Вторая часть строки: перевод слова, описание колоды */
    subtitle?: string;
    /** Справа серым: колода слова, число слов */
    meta?: string;
    run: () => void;
}
