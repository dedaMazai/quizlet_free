import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import intervalPlural from 'i18next-intervalplural-postprocessor';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Поисковые роботы приходят с языком браузера en-US — индексировать должны основной, русский контент
const isBot = /bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent);

i18n.use(Backend)
    .use(LanguageDetector)
    .use(intervalPlural)
    .use(initReactI18next)
    .init({
        lng: isBot ? 'ru' : undefined,
        fallbackLng: 'ru',
        // en-US → en: без лишних запросов /locales/en-US/… перед фолбэком
        supportedLngs: ['ru', 'en'],
        nonExplicitSupportedLngs: true,
        load: 'languageOnly',
        // Системный en-US (в т.ч. в Telegram) → en: иначе i18n.language остаётся en-US
        // и переключатели языка, сравнивающие с 'en', показывают «Русский»
        detection: {
            convertDetectedLanguage: (lng: string) => lng.split('-')[0],
        },
        nsSeparator: '$',
        keySeparator: false,
        // debug: __IS_DEV__,
        debug: false,

        // ru встроен в бандл (ключ без перевода = русский текст), en грузится по сети
        resources: {
            ru: { translation: __RU_TRANSLATIONS__ },
        },
        partialBundledLanguages: true,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },

        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
    });

export default i18n;
