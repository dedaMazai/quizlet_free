// Локальный просмотр прод-сборки с теми же правилами, что на Vercel: npm run serve
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from './lib/staticServer.mjs';

const PORT = Number(process.env.PORT) || 3001;
const buildDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'build');

createStaticServer(buildDir, () => fs.readFileSync(path.join(buildDir, 'index.html'), 'utf-8'))
    .listen(PORT, () => console.log(`build/ → http://localhost:${PORT}`));
