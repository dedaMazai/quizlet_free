const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales');
const EN_PATH = path.join(LOCALES_DIR, 'en', 'translation.json');
const RU_PATH = path.join(LOCALES_DIR, 'ru', 'translation.json');
const REPORT_PATH = path.join(__dirname, 'empty-translations-report.md');

const applyMode = process.argv.includes('--apply');

function scan() {
    const enJson = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'));
    const ruJson = JSON.parse(fs.readFileSync(RU_PATH, 'utf-8'));

    const emptyKeys = Object.entries(enJson)
        .filter(([, value]) => value === '')
        .map(([key]) => key);

    if (emptyKeys.length === 0) {
        console.log('\x1b[32mNo empty translations in en/translation.json\x1b[0m');
        return;
    }

    console.log(`Found ${emptyKeys.length} empty translations in en/translation.json:\n`);

    for (const key of emptyKeys) {
        const ruValue = ruJson[key] || key;
        console.log(`  \x1b[33m"${key}"\x1b[0m`);
        if (ruValue !== key) {
            const displayRu = ruValue.length > 80 ? ruValue.slice(0, 80) + '...' : ruValue;
            console.log(`    ru: ${displayRu}`);
        }
    }

    console.log(`\n\x1b[36mTotal: ${emptyKeys.length} empty keys\x1b[0m`);

    // Generate report
    const lines = [];
    const date = new Date().toISOString().split('T')[0];

    lines.push('# Empty Translations Report');
    lines.push('');
    lines.push(`> ${date} | Empty keys: ${emptyKeys.length}`);
    lines.push('');
    lines.push('> Fill in the English translations below.');
    lines.push('> After filling, run `node scripts/find-empty-string-in-json-en.js --apply`.');
    lines.push('');
    lines.push('## Translations to fill');
    lines.push('');

    for (const key of emptyKeys) {
        const ruValue = ruJson[key] || key;
        lines.push(`### \`${key}\``);
        lines.push('');
        lines.push(`**ru:** ${ruValue}`);
        lines.push('');
        lines.push('**en:**');
        lines.push('');
    }

    fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf-8');
    console.log(`\nReport saved: ${path.relative(path.join(__dirname, '..'), REPORT_PATH)}`);
    console.log('\x1b[33mFill in the translations, then run with --apply to write changes.\x1b[0m');
}

function applyChanges() {
    if (!fs.existsSync(REPORT_PATH)) {
        console.error(`\x1b[31mReport not found: ${REPORT_PATH}\x1b[0m`);
        console.error('Run without --apply first to generate the report.');
        process.exit(1);
    }

    const content = fs.readFileSync(REPORT_PATH, 'utf-8');
    const enJson = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'));

    // Parse report: extract key from ### `key` and en value from **en:** line
    const blocks = content.split('### `');
    let filled = 0;
    let skipped = 0;

    for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];
        const keyEnd = block.indexOf('`');
        if (keyEnd === -1) continue;

        const key = block.substring(0, keyEnd);

        const enMatch = block.match(/\*\*en:\*\*\s*(.+)/);
        if (enMatch && enMatch[1].trim()) {
            const translation = enMatch[1].trim();
            enJson[key] = translation;
            filled++;
            console.log(`  \x1b[32m+\x1b[0m "${key}" → "${translation.length > 60 ? translation.slice(0, 60) + '...' : translation}"`);
        } else {
            skipped++;
        }
    }

    if (filled === 0) {
        console.log('No translations filled in the report.');
        return;
    }

    fs.writeFileSync(EN_PATH, JSON.stringify(enJson, null, 2) + '\n', 'utf-8');

    console.log(`\nFilled: ${filled} | Skipped (empty): ${skipped}`);
    console.log(`[en] Written: ${Object.keys(enJson).length} keys`);
    console.log('\n\x1b[32mDone.\x1b[0m');
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
