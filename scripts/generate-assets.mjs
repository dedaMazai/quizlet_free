// Разовая генерация OG-картинки и иконок в public/ (результат коммитится):
//   node scripts/generate-assets.mjs
// Шаблоны — scripts/assets/*.html. Нужен локальный Chrome (или CHROME_PATH).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchBrowser } from './lib/launchBrowser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const template = (name) => pathToFileURL(path.join(root, 'scripts', 'assets', name)).href;

const ICONS = [
    { file: 'apple-touch-icon.png', size: 180 },
    { file: 'icon-192.png', size: 192 },
    { file: 'icon-512.png', size: 512 },
];
const FAVICON_SIZE = 32;

/** ICO с одним PNG внутри — так его понимают все браузеры и Яндекс */
const pngToIco = (png, size) => {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(1, 4);
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(header.length + entry.length, 12);
    return Buffer.concat([header, entry, png]);
};

const browser = await launchBrowser();

try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 630 });
    await page.goto(template('og-image.html'), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(publicDir, 'og-image.png'), type: 'png' });

    for (const { file, size } of ICONS) {
        await page.setViewport({ width: size, height: size });
        await page.goto(template('icon.html'), { waitUntil: 'load' });
        await page.screenshot({ path: path.join(publicDir, file), type: 'png' });
    }

    await page.setViewport({ width: FAVICON_SIZE, height: FAVICON_SIZE });
    await page.goto(template('icon.html'), { waitUntil: 'load' });
    const favicon = await page.screenshot({ type: 'png' });
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pngToIco(Buffer.from(favicon), FAVICON_SIZE));
} finally {
    await browser.close();
}

for (const file of ['og-image.png', 'favicon.ico', ...ICONS.map((icon) => icon.file)]) {
    console.log(file, `${Math.round(fs.statSync(path.join(publicDir, file)).size / 1024)} KB`);
}
