// Пререндер публичных страниц после webpack (npm run build → postbuild).
// Поисковики и превью мессенджеров получают готовый HTML с текстом и мета-тегами,
// гость видит контент до загрузки JS. Список страниц — build/sitemap.xml (SitemapPlugin).
// Снимок делается гостем: русский язык, светлая тема, десктоп; остальным его убирает
// guard-скрипт в public/index.html. Пропустить: PRERENDER=skip npm run build
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './lib/launchBrowser.mjs';
import { createStaticServer } from './lib/staticServer.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(root, 'build');
const VIEWPORT = { width: 1280, height: 800 };
const PAGE_TIMEOUT_MS = 30000;
// Основные начертания первого экрана: текст и заголовки
const PRELOAD_FONTS = [/^FiraSans-Regular\..+\.woff2$/, /^FiraSansCondensed-SemiBold\..+\.woff2$/];

if (process.env.PRERENDER === 'skip') {
    console.log('prerender: пропущен (PRERENDER=skip)');
    process.exit(0);
}

/** preload шрифтов в шаблон — попадёт и во все снимки */
const addFontPreloads = (html) => {
    if (html.includes('href="/static/fonts/')) return html;

    const fontsDir = path.join(buildDir, 'static', 'fonts');
    const links = fs.readdirSync(fontsDir)
        .filter((file) => PRELOAD_FONTS.some((pattern) => pattern.test(file)))
        .map((file) => `<link rel="preload" href="/static/fonts/${file}" as="font" type="font/woff2" crossorigin>`);

    return html.replace('</head>', `${links.join('')}</head>`);
};

const shellHtml = addFontPreloads(fs.readFileSync(path.join(buildDir, 'index.html'), 'utf-8'));
fs.writeFileSync(path.join(buildDir, 'index.html'), shellHtml);

const routes = [...fs.readFileSync(path.join(buildDir, 'sitemap.xml'), 'utf-8').matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)]
    .map((match) => match[1]);
const snapshotFile = (route) => path.join(buildDir, `${route}.html`);

// Повторный запуск: старые снимки не должны подмешиваться в новые
routes.forEach((route) => fs.rmSync(snapshotFile(route), { force: true }));

// Снимки ещё не записаны — все страницы отдаются исходным шаблоном, как SPA
const server = createStaticServer(buildDir, () => shellHtml);

await new Promise((resolve) => { server.listen(0, '127.0.0.1', resolve); });
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await launchBrowser();

const renderRoute = async (route) => {
    const page = await browser.newPage();

    try {
        await page.setViewport(VIEWPORT);
        await page.emulateMediaFeatures([
            { name: 'prefers-reduced-motion', value: 'reduce' },
            { name: 'prefers-color-scheme', value: 'light' },
        ]);
        await page.evaluateOnNewDocument(() => {
            window.__PRERENDER__ = true;
            localStorage.setItem('i18nextLng', 'ru');
        });
        // Гостю внешние запросы (Supabase, Sentry) для отрисовки публичных страниц не нужны
        await page.setRequestInterception(true);
        page.on('request', (request) => (
            request.url().startsWith(origin) || request.url().startsWith('data:') ? request.continue() : request.abort()
        ));

        await page.goto(`${origin}${route}`, { waitUntil: 'networkidle0', timeout: PAGE_TIMEOUT_MS });
        await page.waitForFunction(
            (expected) => document.documentElement.dataset.pageMeta === 'ready'
                && window.location.pathname === expected
                && document.querySelector('#root main')?.textContent?.trim().length > 0,
            { timeout: PAGE_TIMEOUT_MS },
            route,
        );

        return await page.evaluate(() => {
            // Ленивые чанки страницы (webpack удаляет их <script> после загрузки) — в preload:
            // браузер скачает их параллельно с основным бандлом, а не после него
            performance.getEntriesByType('resource')
                .map((entry) => new URL(entry.name).pathname)
                .filter((pathname) => /^\/static\/js\/.+\.chunk\.js$/.test(pathname))
                .forEach((pathname) => {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'script';
                    link.href = pathname;
                    link.crossOrigin = 'anonymous';
                    document.head.appendChild(link);
                });
            delete document.documentElement.dataset.pageMeta;

            return `<!doctype html>${document.documentElement.outerHTML}`;
        });
    } finally {
        await page.close();
    }
};

try {
    for (const route of routes) {
        const html = await renderRoute(route);
        // /about → about.html: Vercel отдаёт его по /about благодаря cleanUrls (vercel.json)
        const file = snapshotFile(route);

        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, html);
        console.log(`prerender: ${route} (${Math.round(html.length / 1024)} KB)`);
    }
} finally {
    await browser.close();
    server.close();
}
