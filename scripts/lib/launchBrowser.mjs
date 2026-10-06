import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const LOCAL_CHROME_PATHS = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

/**
 * Headless Chrome для пререндера и генерации картинок.
 * CHROME_PATH → локальный Chrome → на Linux (сборка Vercel, Amazon Linux 2023)
 * @sparticuz/chromium: в нём уже есть системные библиотеки, которых нет в образе сборки.
 */
export const launchBrowser = async () => {
    let executablePath = process.env.CHROME_PATH || LOCAL_CHROME_PATHS.find((path) => fs.existsSync(path));
    let args = [];

    if (!executablePath && process.platform === 'linux') {
        const { default: chromium } = await import('@sparticuz/chromium');
        executablePath = await chromium.executablePath();
        args = chromium.args;
    }

    if (!executablePath) {
        throw new Error('Chrome не найден: укажите путь в CHROME_PATH');
    }

    return puppeteer.launch({ executablePath, args, headless: true });
};
