import { useTranslation } from 'react-i18next';

/** «Интервал вырос: слово вернётся через 3 дня»; без интервала — undefined */
export const useIntervalNote = (intervalDays: number | undefined) => {
    const { t } = useTranslation();

    if (intervalDays === undefined) return undefined;

    // Склонение «день / дня / дней» — плюральными ключами i18next (_one, _few, _many, _other)
    return t('Интервал вырос: слово вернётся через {{count}} дн.', { count: intervalDays });
};
