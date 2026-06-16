
import { getUA } from 'react-device-detect';

export const IS_OLD_SAFARI = /Version\/(1[0-2]|[1-9])(\.\d+)*\s+Safari\//.test(getUA);

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const GENDER = {
    male: 'Муж',
    female: 'Жен',
} as const;

export type GenderUser = keyof typeof GENDER;

export const LANGUAGE_ENUM = {
    ru: 'Русский',
    en: 'English',
} as const;

export type LanguageEnum = keyof typeof LANGUAGE_ENUM;

export const BOOLEAN_OPTIONS = [
    {
        value: true,
        label: 'Да',
    },
    {
        value: false,
        label: 'Нет',
    },
] as const;

export const QUARTERS = [
    {
        value: 1,
        label: 'I квартал',
    },
    {
        value: 2,
        label: 'II квартал',
    },
    {
        value: 3,
        label: 'III квартал',
    },
    {
        value: 4,
        label: 'IV квартал',
    },
] as const;

export const YEARS = [
    2015,
    2016,
    2017,
    2018,
    2019,
    2020,
    2021,
    2022,
    2023,
    2024,
    2025,
    2026,
    2027,
    2028,
    2029,
    2030,
] as const;


export const SORT_NAMES = {
    dateAsc: {
        label: 'По дате (раньше)',
        ordering_type: 'ascending',
        order_by: 'created_at',
    },
    dateDesc: {
        label: 'По дате (позже)',
        ordering_type: 'descending',
        order_by: 'created_at',
    },
    alphabetAsc: {
        label: 'По алфавиту А-Я',
        ordering_type: 'ascending',
        order_by: 'name',
    },
    alphabetDesc: {
        label: 'По алфавиту Я-А',
        ordering_type: 'descending',
        order_by: 'name',
    },
} as const;

export const TIME_ZONES = [
    'UTC',
    'Europe/Moscow',
    'Asia/Dubai',
    // ...Intl.supportedValuesOf('timeZone')
] as const;


export const OrderingMap = {
    ascend: 'ascending',
    descend : 'descending',
} as const;

export const EXCEL_TYPES = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
];

export const WORD_TYPES = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
];

export const PDF_TYPES = [
    'application/pdf',
];

export const IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
];

export const ZIP_TYPES = [
    '.7z',
    'application/x-7z',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-7z-compressed',
    'application/7z',
];

export const MONTHS = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
];

export const WEEKDAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'] as const;


export const WEEKDAYS_SHORT = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'] as const;

export const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8;
    if (hour >= 24) return `${hour - 24}:00`;
    return `${hour}:00`;
}); // 8:00 - 22:00

export const MOSCOW_TIMEZONE = 'Europe/Moscow';