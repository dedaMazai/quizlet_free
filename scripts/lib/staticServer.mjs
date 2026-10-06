import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.xml': 'application/xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
};

const isFile = (file) => fs.existsSync(file) && fs.statSync(file).isFile();

/**
 * Раздача build/ как на Vercel (vercel.json): файл → <путь>.html (cleanUrls) → SPA-шаблон.
 * getShell — HTML для остальных путей (rewrite на index.html).
 */
export const createStaticServer = (buildDir, getShell) => http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const candidates = [path.join(buildDir, pathname), path.join(buildDir, `${pathname.replace(/\/+$/, '')}.html`)];
    const file = candidates.find((candidate) => candidate.startsWith(buildDir) && isFile(candidate));

    if (file) {
        res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(file)] ?? 'application/octet-stream' });
        fs.createReadStream(file).pipe(res);
        return;
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
    res.end(getShell());
});
