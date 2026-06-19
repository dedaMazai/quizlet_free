/**
 * Утилиты импорта/экспорта карточек через Excel (.xlsx).
 * exceljs грузится динамически — попадает в отдельный чанк и не утяжеляет основной бандл.
 */

export interface ParsedCardRow {
  term: string;
  translation: string;
  example?: string;
}

export interface ParsedCardsImport {
  /** Валидные строки (непустые term и translation). */
  rows: ParsedCardRow[];
  /** Строки данных, пропущенные из-за отсутствия term или translation. */
  skipped: number;
  /** Всего строк данных в файле (без строки заголовка). */
  total: number;
}

const TEMPLATE_FILE_NAME = 'cards-template.xlsx';

const HEADER_FILL_COLOR = 'FF3A539B';
const HEADER_TEXT_COLOR = 'FFFFFFFF';

// Колонки шаблона: слово (англ.) и перевод (рус.). Примеры — необязательная
// третья колонка, которую парсер тоже понимает, но в шаблон её не включаем.
const EXAMPLE_ROWS: [string, string][] = [
  ['go in', 'заходить'],
];

/** Генерирует и скачивает .xlsx-шаблон с оформленными заголовками English / Русский. */
export const downloadCardsTemplate = async (): Promise<void> => {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Cards');

  sheet.columns = [
    { header: 'English', width: 30 },
    { header: 'Русский', width: 30 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL_COLOR } };
    cell.font = { bold: true, size: 12, color: { argb: HEADER_TEXT_COLOR } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  EXAMPLE_ROWS.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = TEMPLATE_FILE_NAME;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Парсит .xlsx-файл с карточками. Колонки читаются по позиции (A — слово,
 * B — перевод, C — пример), первая строка считается заголовком и пропускается.
 */
export const parseCardsFromExcel = async (file: File): Promise<ParsedCardsImport> => {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { rows: [], skipped: 0, total: 0 };
  }

  const rows: ParsedCardRow[] = [];
  let total = 0;
  let skipped = 0;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // заголовок

    const term = String(row.getCell(1).text ?? '').trim();
    const translation = String(row.getCell(2).text ?? '').trim();
    const example = String(row.getCell(3).text ?? '').trim();

    // Полностью пустые строки не учитываем.
    if (!term && !translation && !example) return;

    total += 1;

    if (term && translation) {
      rows.push({ term, translation, example: example || undefined });
    } else {
      skipped += 1;
    }
  });

  return { rows, skipped, total };
};
