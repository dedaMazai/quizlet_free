const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const RU_PATH = path.join(ROOT, 'public/locales/ru/translation.json');
const EN_PATH = path.join(ROOT, 'public/locales/en/translation.json');
const REPORT_PATH = path.join(ROOT, 'scripts', 'clean-translations-report.md');

const applyMode = process.argv.includes('--apply');

const CYRILLIC_RE = /[А-Яа-яЁё]/;

function isEnglishOnly(key) {
    return !CYRILLIC_RE.test(key);
}

// ─── Phase 1: Analysis & Report Generation ───

function getSourceFiles() {
    return glob.sync('**/*.{ts,tsx}', {
        cwd: SRC_DIR,
        absolute: true,
        ignore: ['**/*.test.*', '**/*.stories.*', '**/*.d.ts', '**/node_modules/**'],
    });
}

function loadSourceContents(files) {
    return files.map((file) => fs.readFileSync(file, 'utf-8'));
}

function isKeyUsed(key, sourceContents) {
    for (const content of sourceContents) {
        if (content.includes(key)) {
            return true;
        }
    }
    return false;
}

function analyze() {
    const files = getSourceFiles();
    console.log(`Source files loaded: ${files.length}`);

    const sourceContents = loadSourceContents(files);

    const ruJson = JSON.parse(fs.readFileSync(RU_PATH, 'utf-8'));
    const enJson = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'));
    const ruKeys = Object.keys(ruJson);
    const enKeys = Object.keys(enJson);
    const ruKeysSet = new Set(ruKeys);
    const enKeysSet = new Set(enKeys);

    // Step 1: ru keys not found in project source → remove from ru
    // Skip English-only keys — these are backend error messages, not used in frontend source
    const ruToRemove = [];
    let skippedEnglish = 0;
    for (const key of ruKeys) {
        if (isEnglishOnly(key)) {
            skippedEnglish++;
            continue;
        }
        if (!isKeyUsed(key, sourceContents)) {
            ruToRemove.push(key);
        }
    }

    // Step 2: en keys not in ru → remove from en
    const enToRemove = enKeys.filter((key) => !ruKeysSet.has(key));

    // Step 3: ru keys not in en → add to en
    const enToAdd = ruKeys.filter((key) => !enKeysSet.has(key));

    return { ruToRemove, enToRemove, enToAdd, ruTotal: ruKeys.length, enTotal: enKeys.length, skippedEnglish };
}

function generateReport({ ruToRemove, enToRemove, enToAdd, ruTotal, enTotal }) {
    const date = new Date().toISOString().split('T')[0];
    const lines = [];

    lines.push('# Clean Translations Report');
    lines.push('');
    lines.push(`> ${date}`);
    lines.push('');
    lines.push('> Edit this file before running `node scripts/clean-translations.js --apply`.');
    lines.push('> Remove lines with keys you want to **keep** (not delete/not add).');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push('| Locale | Total | Remove | Add |');
    lines.push('|--------|-------|--------|-----|');
    lines.push(`| ru | ${ruTotal} | ${ruToRemove.length} | — |`);
    lines.push(`| en | ${enTotal} | ${enToRemove.length} | ${enToAdd.length} |`);
    lines.push('');

    if (ruToRemove.length > 0) {
        lines.push('## [ru] Unused keys to remove');
        lines.push('');
        for (const key of ruToRemove) {
            lines.push(`- \`${key}\``);
        }
        lines.push('');
    }

    if (enToRemove.length > 0) {
        lines.push('## [en] Keys to remove (not in ru)');
        lines.push('');
        for (const key of enToRemove) {
            lines.push(`- \`${key}\``);
        }
        lines.push('');
    }

    if (enToAdd.length > 0) {
        lines.push('## [en] Keys to add (missing from en)');
        lines.push('');
        for (const key of enToAdd) {
            lines.push(`- \`${key}\``);
        }
        lines.push('');
    }

    fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf-8');
}

function printAnalysis({ ruToRemove, enToRemove, enToAdd, ruTotal, enTotal, skippedEnglish }) {
    console.log(`\n[ru] Total keys: ${ruTotal} (skipped ${skippedEnglish} English-only keys)`);
    console.log(`[ru] Unused keys to remove: ${ruToRemove.length}`);
    for (const key of ruToRemove) {
        console.log(`  \x1b[31m- ${key}\x1b[0m`);
    }

    console.log(`\n[en] Total keys: ${enTotal}`);
    console.log(`[en] Keys to remove (not in ru): ${enToRemove.length}`);
    for (const key of enToRemove) {
        console.log(`  \x1b[31m- ${key}\x1b[0m`);
    }

    console.log(`\n[en] Keys to add (missing from en): ${enToAdd.length}`);
    for (const key of enToAdd) {
        console.log(`  \x1b[32m+ ${key}\x1b[0m`);
    }

    console.log('\n' + '\u2500'.repeat(60));
    console.log(`[ru] remove: ${ruToRemove.length}`);
    console.log(`[en] remove: ${enToRemove.length} | add: ${enToAdd.length}`);
}

// ─── Phase 2: Apply from Report ───

function parseReport() {
    if (!fs.existsSync(REPORT_PATH)) {
        console.error(`\x1b[31mReport not found: ${REPORT_PATH}\x1b[0m`);
        console.error('Run without --apply first to generate the report.');
        process.exit(1);
    }

    const content = fs.readFileSync(REPORT_PATH, 'utf-8');
    const lines = content.split('\n');

    const sections = {
        ruToRemove: [],
        enToRemove: [],
        enToAdd: [],
    };

    let currentSection = null;

    for (const line of lines) {
        if (line.startsWith('## [ru] Unused keys to remove')) {
            currentSection = 'ruToRemove';
            continue;
        }
        if (line.startsWith('## [en] Keys to remove')) {
            currentSection = 'enToRemove';
            continue;
        }
        if (line.startsWith('## [en] Keys to add')) {
            currentSection = 'enToAdd';
            continue;
        }
        if (line.startsWith('## ') || line.startsWith('# ')) {
            currentSection = null;
            continue;
        }

        if (currentSection) {
            const match = line.match(/^- `(.+)`$/);
            if (match) {
                sections[currentSection].push(match[1]);
            }
        }
    }

    return sections;
}

function applyChanges() {
    const { ruToRemove, enToRemove, enToAdd } = parseReport();

    console.log('Applying changes from report...');
    console.log(`  [ru] keys to remove: ${ruToRemove.length}`);
    console.log(`  [en] keys to remove: ${enToRemove.length}`);
    console.log(`  [en] keys to add:    ${enToAdd.length}`);

    const ruJson = JSON.parse(fs.readFileSync(RU_PATH, 'utf-8'));
    const enJson = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'));

    // Remove from ru
    const ruRemoveSet = new Set(ruToRemove);
    const newRu = {};
    for (const key of Object.keys(ruJson)) {
        if (!ruRemoveSet.has(key)) {
            newRu[key] = ruJson[key];
        }
    }

    // Remove from en
    const enRemoveSet = new Set(enToRemove);
    const newEn = {};
    for (const key of Object.keys(enJson)) {
        if (!enRemoveSet.has(key)) {
            newEn[key] = enJson[key];
        }
    }

    // Add missing to en (copy ru value as placeholder)
    for (const key of enToAdd) {
        if (!(key in newEn) && key in ruJson) {
            newEn[key] = '';
        }
    }

    // Also remove from en keys that were removed from ru (even if not in enToRemove list)
    for (const key of ruToRemove) {
        if (key in newEn) {
            delete newEn[key];
        }
    }

    fs.writeFileSync(RU_PATH, JSON.stringify(newRu, null, 2) + '\n', 'utf-8');
    fs.writeFileSync(EN_PATH, JSON.stringify(newEn, null, 2) + '\n', 'utf-8');

    console.log(`\n[ru] Written: ${Object.keys(newRu).length} keys`);
    console.log(`[en] Written: ${Object.keys(newEn).length} keys`);
    console.log('\n\x1b[32mDone.\x1b[0m');
}

// ─── Main ───

function main() {
    if (applyMode) {
        console.log('Mode: APPLY (reading from report)\n');
        applyChanges();
    } else {
        console.log('Mode: DRY-RUN (generating report)\n');
        const result = analyze();
        printAnalysis(result);
        generateReport(result);
        console.log(`\nReport saved: ${path.relative(ROOT, REPORT_PATH)}`);
        console.log('\x1b[33mReview and edit the report, then run with --apply to write changes.\x1b[0m');
    }
}

main();
