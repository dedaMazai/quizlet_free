const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.resolve(__dirname, '..');
const RU_PATH = path.join(ROOT, 'public/locales/ru/translation.json');
const EN_PATH = path.join(ROOT, 'public/locales/en/translation.json');
const SRC_DIR = path.join(ROOT, 'src');
const REPORT_PATH = path.join(ROOT, 'scripts', 'translation-report.md');

const applyMode = process.argv.includes('--apply');

const CYRILLIC_RE = /[А-Яа-яЁё]/;

/**
 * For a key like "Введите минимум ... символа для поиска",
 * find a matching translation key with {{}} interpolation,
 * e.g. "Введите минимум {{count}} символа для поиска"
 */
function findInterpolatedKey(keyWithDots, translationKeys) {
    // Escape regex special chars, then replace "..." with pattern matching {{...}}
    const pattern = keyWithDots
        .split('...')
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('\\{\\{\\w+\\}\\}');
    const re = new RegExp(`^${pattern}$`);
    for (const key of translationKeys) {
        if (re.test(key)) {
            return key;
        }
    }
    return null;
}

const SKIP_FILE_PATTERNS = [/\.test\./, /\.stories\./, /\.d\.ts$/];

const SKIP_LINE_PATTERNS = [
    /^\s*\/\//, // single-line comment
    /^\s*\*/, // block comment line
    /^\s*\/\*/, // block comment start
    /console\.(log|warn|error|info|debug)/, // console calls
    /^\s*import\s/, // import statements
    /^\s*export\s+type\s/, // type exports
    /^\s*type\s+\w/, // type declarations
    /^\s*interface\s/, // interface declarations
    /throw\s+new\s+Error/, // error throws
    /^\s*\*\s*@/, // JSDoc tags
    /eslint-disable/, // eslint comments
    /TODO|FIXME|HACK|NOTE/i, // dev comments
    /className/, // CSS class assignments
    /data-testid/, // test attributes
];

function loadTranslationKeys() {
    const raw = fs.readFileSync(RU_PATH, 'utf-8');
    const json = JSON.parse(raw);
    return new Set(Object.keys(json));
}

function getSourceFiles() {
    return glob.sync('**/*.{ts,tsx}', {
        cwd: SRC_DIR,
        absolute: true,
        ignore: ['**/*.test.*', '**/*.stories.*', '**/*.d.ts', '**/node_modules/**'],
    });
}

function isInsideBlockComment(lines, lineIndex) {
    let inBlock = false;
    for (let i = 0; i <= lineIndex; i++) {
        const line = lines[i];
        let j = 0;
        while (j < line.length) {
            if (inBlock) {
                const end = line.indexOf('*/', j);
                if (end === -1) break;
                inBlock = false;
                j = end + 2;
            } else {
                const start = line.indexOf('/*', j);
                const singleLine = line.indexOf('//', j);
                if (singleLine !== -1 && (start === -1 || singleLine < start)) break;
                if (start === -1) break;
                inBlock = true;
                j = start + 2;
            }
        }
    }
    return inBlock;
}

function extractStringLiterals(line) {
    const results = [];
    let i = 0;
    while (i < line.length) {
        const ch = line[i];
        if (ch === "'" || ch === '"') {
            const quote = ch;
            let j = i + 1;
            let value = '';
            while (j < line.length && line[j] !== quote) {
                if (line[j] === '\\') {
                    value += line[j + 1] || '';
                    j += 2;
                } else {
                    value += line[j];
                    j++;
                }
            }
            if (j < line.length) {
                results.push({ text: value, start: i, end: j, quote });
            }
            i = j + 1;
        } else if (ch === '`') {
            let j = i + 1;
            let depth = 0;
            let current = '';
            let segments = [];
            while (j < line.length) {
                if (line[j] === '\\') {
                    current += line[j + 1] || '';
                    j += 2;
                } else if (line[j] === '$' && line[j + 1] === '{') {
                    if (current) segments.push(current);
                    current = '';
                    depth = 1;
                    j += 2;
                    while (j < line.length && depth > 0) {
                        if (line[j] === '{') depth++;
                        else if (line[j] === '}') depth--;
                        j++;
                    }
                } else if (line[j] === '`') {
                    break;
                } else {
                    current += line[j];
                    j++;
                }
            }
            if (current) segments.push(current);
            const fullText = segments.join('...');
            if (j < line.length) {
                results.push({ text: fullText, start: i, end: j, quote: '`' });
            }
            i = j + 1;
        } else {
            i++;
        }
    }
    return results;
}

function extractTCallKeys(line) {
    const keys = [];
    const tCallStart = /\bt\(\s*/g;
    let m;
    while ((m = tCallStart.exec(line)) !== null) {
        const afterT = m.index + m[0].length;
        if (afterT >= line.length) continue;
        const quote = line[afterT];
        if (quote !== "'" && quote !== '"' && quote !== '`') continue;

        const remaining = line.slice(afterT);
        const literals = extractStringLiterals(remaining);
        if (literals.length > 0 && literals[0].start === 0) {
            keys.push({
                key: literals[0].text,
                quote: literals[0].quote,
                start: m.index,
                end: afterT + literals[0].end + 1,
            });
        }
    }
    return keys;
}

function extractTransKeys(line) {
    const keys = [];
    const re = /<Trans\s[^>]*i18nKey=["']([^"']+)["']/g;
    let m;
    while ((m = re.exec(line)) !== null) {
        keys.push(m[1]);
    }
    return keys;
}

function extractJsxText(line) {
    const results = [];
    const re = />([^<>{]*[А-Яа-яЁё][^<>{}]*)</g;
    let m;
    while ((m = re.exec(line)) !== null) {
        const text = m[1].trim();
        if (!text || text.length < 2) continue;
        if (/^[\s\d.,;:!?()[\]{}|/\\-]+$/.test(text)) continue;
        results.push(text);
    }
    return results;
}

function analyzeFile(filePath, translationKeys) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = [];
    const isTsx = filePath.endsWith('.tsx');

    lines.forEach((line, idx) => {
        if (SKIP_LINE_PATTERNS.some((p) => p.test(line))) return;
        if (isInsideBlockComment(lines, idx)) return;

        const lineClean = stripInlineComment(line);

        const tCalls = extractTCallKeys(lineClean);
        for (const { key, quote } of tCalls) {
            // Template literal with JS interpolation in t() — check if matching
            // key with i18next {{}} interpolation exists in translations
            if (quote === '`' && key.includes('...')) {
                const matchingKey = findInterpolatedKey(key, translationKeys);
                if (matchingKey) {
                    // Key exists with i18next interpolation — OK, but wrong usage in code
                    issues.push({
                        line: idx + 1,
                        type: 'WRONG_INTERPOLATION',
                        text: key.length > 80 ? key.slice(0, 80) + '...' : key,
                        fullText: matchingKey,
                    });
                } else {
                    // No matching key found — missing translation
                    issues.push({
                        line: idx + 1,
                        type: 'MISSING_KEY_INTERPOLATED',
                        text: key.length > 80 ? key.slice(0, 80) + '...' : key,
                        fullText: key,
                    });
                }
                continue;
            }
            if (CYRILLIC_RE.test(key) && !translationKeys.has(key)) {
                issues.push({
                    line: idx + 1,
                    type: 'MISSING_KEY',
                    text: key.length > 80 ? key.slice(0, 80) + '...' : key,
                    fullText: key,
                });
            }
        }

        const transKeys = extractTransKeys(lineClean);
        for (const key of transKeys) {
            if (CYRILLIC_RE.test(key) && !translationKeys.has(key)) {
                issues.push({
                    line: idx + 1,
                    type: 'MISSING_KEY',
                    text: key.length > 80 ? key.slice(0, 80) + '...' : key,
                    fullText: key,
                });
            }
        }

        let maskedLine = lineClean;
        const tCallsSorted = [...tCalls].sort((a, b) => b.start - a.start);
        for (const { start, end } of tCallsSorted) {
            maskedLine = maskedLine.slice(0, start) + ' '.repeat(end - start) + maskedLine.slice(end);
        }

        const literals = extractStringLiterals(maskedLine);
        for (const { text } of literals) {
            if (!text || text.length < 2) continue;
            if (!CYRILLIC_RE.test(text)) continue;
            if (/^[a-zA-Z0-9_\-./]+$/.test(text)) continue;

            issues.push({
                line: idx + 1,
                type: 'UNWRAPPED',
                text: text.length > 80 ? text.slice(0, 80) + '...' : text,
                fullText: text,
            });
        }

        if (isTsx) {
            const jsxTexts = extractJsxText(maskedLine);
            for (const text of jsxTexts) {
                if (/\{.*t\(/.test(text)) continue;
                issues.push({
                    line: idx + 1,
                    type: 'JSX_TEXT',
                    text: text.length > 80 ? text.slice(0, 80) + '...' : text,
                    fullText: text,
                });
            }
        }
    });

    return issues;
}

function stripInlineComment(line) {
    let inString = false;
    let quote = '';
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inString) {
            if (ch === '\\') {
                i++;
            } else if (ch === quote) {
                inString = false;
            } else if (quote === '`' && ch === '$' && line[i + 1] === '{') {
                let depth = 1;
                i += 2;
                while (i < line.length && depth > 0) {
                    if (line[i] === '{') depth++;
                    else if (line[i] === '}') depth--;
                    if (depth > 0) i++;
                }
            }
        } else {
            if (ch === '/' && line[i + 1] === '/') {
                return line.slice(0, i);
            }
            if (ch === "'" || ch === '"' || ch === '`') {
                inString = true;
                quote = ch;
            }
        }
    }
    return line;
}

function generateMarkdownReport(results, totalMissing, totalUnwrapped, totalJsx) {
    const lines = [];
    const date = new Date().toISOString().split('T')[0];

    const missingKeys = new Set();
    for (const { issues } of results) {
        for (const issue of issues) {
            if (issue.type === 'MISSING_KEY') {
                missingKeys.add(issue.fullText);
            }
        }
    }

    lines.push('# Translation Report');
    lines.push('');
    lines.push(`> ${date} | MISSING_KEY: ${totalMissing} | UNWRAPPED: ${totalUnwrapped + totalJsx}`);
    lines.push('');
    lines.push('> Edit this file before running `node scripts/find-missing-translations.js --apply`.');
    lines.push('> Remove lines with keys you do **not** want to add.');
    lines.push('');

    if (missingKeys.size > 0) {
        const sortedMissing = [...missingKeys].sort();

        lines.push('## MISSING_KEY — keys to add to ru and en');
        lines.push('');
        for (const key of sortedMissing) {
            lines.push(`- \`${key}\``);
        }
        lines.push('');
    }

    return lines.join('\n');
}

// ─── Apply from Report ───

function parseReport() {
    if (!fs.existsSync(REPORT_PATH)) {
        console.error(`\x1b[31mReport not found: ${REPORT_PATH}\x1b[0m`);
        console.error('Run without --apply first to generate the report.');
        process.exit(1);
    }

    const content = fs.readFileSync(REPORT_PATH, 'utf-8');
    const lines = content.split('\n');

    const keysToAdd = [];
    let inMissingSection = false;

    for (const line of lines) {
        if (line.startsWith('## MISSING_KEY')) {
            inMissingSection = true;
            continue;
        }
        if (line.startsWith('## ') || line.startsWith('# ')) {
            inMissingSection = false;
            continue;
        }

        if (inMissingSection) {
            const match = line.match(/^- `(.+)`$/);
            if (match) {
                keysToAdd.push(match[1]);
            }
        }
    }

    return keysToAdd;
}

function applyChanges() {
    const keysToAdd = parseReport();

    if (keysToAdd.length === 0) {
        console.log('No keys to add from report.');
        return;
    }

    console.log(`Adding ${keysToAdd.length} keys to ru and en...\n`);

    const ruJson = JSON.parse(fs.readFileSync(RU_PATH, 'utf-8'));
    const enJson = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'));

    let addedRu = 0;
    let addedEn = 0;

    for (const key of keysToAdd) {
        if (!(key in ruJson)) {
            ruJson[key] = key;
            addedRu++;
        }
        if (!(key in enJson)) {
            enJson[key] = '';
            addedEn++;
        }
    }

    fs.writeFileSync(RU_PATH, JSON.stringify(ruJson, null, 2) + '\n', 'utf-8');
    fs.writeFileSync(EN_PATH, JSON.stringify(enJson, null, 2) + '\n', 'utf-8');

    console.log(`[ru] Added: ${addedRu} keys (total: ${Object.keys(ruJson).length})`);
    console.log(`[en] Added: ${addedEn} keys (total: ${Object.keys(enJson).length})`);
    console.log('\n\x1b[32mDone.\x1b[0m');
}

function scan() {
    const translationKeys = loadTranslationKeys();
    console.log(`Loaded translation keys: ${translationKeys.size}\n`);

    const files = getSourceFiles();
    console.log(`Scanning files: ${files.length}\n`);

    let totalMissing = 0;
    let totalUnwrapped = 0;
    let totalJsx = 0;
    let totalWrongInterp = 0;
    const results = [];

    for (const file of files) {
        if (SKIP_FILE_PATTERNS.some((p) => p.test(file))) continue;
        const issues = analyzeFile(file, translationKeys);
        if (issues.length > 0) {
            results.push({ file, issues });
            for (const issue of issues) {
                if (issue.type === 'MISSING_KEY') totalMissing++;
                else if (issue.type === 'MISSING_KEY_INTERPOLATED') totalWrongInterp++;
                else if (issue.type === 'WRONG_INTERPOLATION') totalWrongInterp++;
                else if (issue.type === 'JSX_TEXT') totalJsx++;
                else totalUnwrapped++;
            }
        }
    }

    results.sort((a, b) => a.file.localeCompare(b.file));

    // Console output
    const TYPE_LABELS = {
        MISSING_KEY: '\x1b[31m[MISSING_KEY]\x1b[0m',
        MISSING_KEY_INTERPOLATED: '\x1b[31m[MISSING_KEY_INTERPOLATED]\x1b[0m',
        WRONG_INTERPOLATION: '\x1b[33m[WRONG_INTERPOLATION]\x1b[0m',
        UNWRAPPED: '\x1b[33m[UNWRAPPED]\x1b[0m',
        JSX_TEXT: '\x1b[35m[JSX_TEXT]\x1b[0m',
    };

    for (const { file, issues } of results) {
        const relPath = path.relative(ROOT, file);
        console.log(`\x1b[36m${relPath}\x1b[0m`);
        for (const issue of issues) {
            console.log(`  L${issue.line} ${TYPE_LABELS[issue.type]} ${issue.text}`);
        }
        console.log('');
    }

    console.log('\u2500'.repeat(60));
    console.log(`MISSING_KEY:          ${totalMissing}`);
    console.log(`WRONG_INTERPOLATION:  ${totalWrongInterp}`);
    console.log(`UNWRAPPED:            ${totalUnwrapped}`);
    console.log(`JSX_TEXT:             ${totalJsx}`);
    console.log(`Total:                ${totalMissing + totalWrongInterp + totalUnwrapped + totalJsx}`);

    // Markdown report
    const md = generateMarkdownReport(results, totalMissing, totalUnwrapped, totalJsx);
    fs.writeFileSync(REPORT_PATH, md, 'utf-8');
    console.log(`\nReport saved: ${path.relative(ROOT, REPORT_PATH)}`);
    console.log('\x1b[33mReview and edit the report, then run with --apply to write changes.\x1b[0m');
}

function main() {
    if (applyMode) {
        console.log('Mode: APPLY (reading from report)\n');
        applyChanges();
    } else {
        console.log('Mode: DRY-RUN (generating report)\n');
        scan();
    }
}

main();
