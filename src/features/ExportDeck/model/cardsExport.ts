/**
 * Утилиты экспорта карточек колоды в файлы: Excel (.xlsx), JSON (.json), Markdown (.md).
 * exceljs грузится динамически — попадает в отдельный чанк и не утяжеляет основной бандл.
 */
import { Card } from '@/entities/Card';

const HEADER_FILL_COLOR = 'FF3A539B';
const HEADER_TEXT_COLOR = 'FFFFFFFF';

const EXCEL_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Заменяет недопустимые для имени файла символы на «_». Пустое имя → «deck». */
const sanitizeFileName = (name: string): string => {
  const cleaned = name.replace(/[/\\:*?"<>|]/g, '_').trim();
  return cleaned || 'deck';
};

/** Скачивает Blob под указанным именем через временную ссылку. */
const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/** Экранирует значение ячейки для Markdown-таблицы. */
const escapeMarkdownCell = (value: string): string =>
  value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

/**
 * Экспорт в .xlsx. Колонки English / Русский / Пример — симметрично импорту,
 * поэтому скачанный файл можно загрузить обратно через «Добавить слова».
 */
export const exportCardsToExcel = async (cards: Card[], deckName: string): Promise<void> => {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Cards');

  sheet.columns = [
    { header: 'English', width: 30 },
    { header: 'Русский', width: 30 },
    { header: 'Пример', width: 40 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL_COLOR } };
    cell.font = { bold: true, size: 12, color: { argb: HEADER_TEXT_COLOR } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  cards.forEach((card) => {
    sheet.addRow([card.term, card.translation, card.example ?? '']);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: EXCEL_MIME });
  downloadBlob(blob, `${sanitizeFileName(deckName)}.xlsx`);
};

/** Экспорт в .json — массив объектов { term, translation, example }. */
export const exportCardsToJson = async (cards: Card[], deckName: string): Promise<void> => {
  const data = cards.map((card) => ({
    term: card.term,
    translation: card.translation,
    example: card.example,
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${sanitizeFileName(deckName)}.json`);
};

/** Экспорт в .md — заголовок колоды и GitHub-таблица English / Русский / Пример. */
export const exportCardsToMarkdown = async (cards: Card[], deckName: string): Promise<void> => {
  const lines = [
    `# ${deckName}`,
    '',
    '| English | Русский | Пример |',
    '| --- | --- | --- |',
    ...cards.map((card) => {
      const term = escapeMarkdownCell(card.term);
      const translation = escapeMarkdownCell(card.translation);
      const example = escapeMarkdownCell(card.example ?? '');
      return `| ${term} | ${translation} | ${example} |`;
    }),
  ];
  const blob = new Blob([`${lines.join('\n')}\n`], { type: 'text/markdown' });
  downloadBlob(blob, `${sanitizeFileName(deckName)}.md`);
};
