import i18n from '@/shared/config/i18n/i18n';

interface FormatRelativeTimeOptions {
    locale?: string;
}

/**
 * Formats a date to relative time: «только что», «5 минут назад», «вчера»,
 * «3 дня назад» for recent values, and an absolute date («15 янв» / «15 янв 2024»)
 * once it is older than a week. Labels follow the active i18next language.
 */
export function formatRelativeTime(
    date?: string | Date,
    options?: FormatRelativeTimeOptions,
): string {
    if (!date) return '';
    const target = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(target.getTime())) return '';

    const locale = options?.locale ?? i18n.language;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - target.getTime()) / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    // Календарная разница (полночь-полночь), а не скользящие сутки —
    // чтобы «вчера» совпадало с календарным вчерашним днём.
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const diffDays = Math.round((startToday.getTime() - startTarget.getTime()) / 86_400_000);

    const tr = (key: string, count?: number): string =>
        i18n.t(key, { lng: locale, ...(count !== undefined ? { count } : {}) });

    if (diffSec < 60) return tr('только что');
    if (diffMin < 60) return tr('{{count}} мин. назад', diffMin);
    if (diffDays === 0) return tr('{{count}} час назад', diffHour);
    if (diffDays === 1) return tr('вчера');
    if (diffDays < 7) return tr('{{count}} день назад', diffDays);

    const sameYear = target.getFullYear() === now.getFullYear();
    return target.toLocaleDateString(locale, sameYear
        ? { day: 'numeric', month: 'short' }
        : { day: 'numeric', month: 'short', year: 'numeric' });
}
