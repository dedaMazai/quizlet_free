import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { SITE_URL } from '@/shared/config/router/siteUrl';

/** Название продукта не переводится. */
const BASE_TITLE = 'Zubrika';

interface PageMeta {
    /** Заголовок страницы без названия продукта; без него — просто «Zubrika». */
    title?: string;
    description?: string;
    /** Теги задаёт вложенная страница — layout их не перетирает. */
    skip?: boolean;
}

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);

    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.content = content;
};

const setCanonical = (href: string) => {
    let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!el) {
        el = document.createElement('link');
        el.rel = 'canonical';
        document.head.appendChild(el);
    }
    el.href = href;
};

const getMeta = (attr: 'name' | 'property', key: string) => (
    document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)?.content ?? ''
);

// Описание из public/index.html — им страницы без своего описания и откатываются
const DEFAULT_DESCRIPTION = getMeta('name', 'description');

/**
 * Title, description, canonical и OpenGraph/Twitter-теги публичной страницы.
 * Мессенджеры и поисковики JS не исполняют — теги попадают в HTML
 * через пререндер при сборке (scripts/prerender.ts), он ждёт флаг `data-page-meta`.
 */
export const usePageMeta = ({ title, description, skip }: PageMeta) => {
    const { pathname } = useLocation();

    useEffect(() => {
        if (skip) return undefined;

        const fullTitle = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
        const text = description || DEFAULT_DESCRIPTION;
        const url = `${SITE_URL}${pathname.replace(/\/+$/, '')}`;

        document.title = fullTitle;
        setMeta('name', 'description', text);
        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', text);
        setMeta('property', 'og:url', url);
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', text);
        setCanonical(url);
        document.documentElement.dataset.pageMeta = 'ready';

        return () => {
            document.title = BASE_TITLE;
            delete document.documentElement.dataset.pageMeta;
        };
    }, [title, description, pathname, skip]);
};
