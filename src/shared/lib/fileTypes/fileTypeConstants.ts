export const FILE_TYPES = {
  PDF: 'pdf',
  DOC: 'doc',
  DOCX: 'docx',
  XLS: 'xls',
  XLSX: 'xlsx',
  PPT: 'ppt',
  PPTX: 'pptx',
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES];

export const OFFICE_MIME_TYPES = {
  [FILE_TYPES.DOC]: ['doc', 'application/msword'],
  [FILE_TYPES.DOCX]: [
    'docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  [FILE_TYPES.XLS]: ['xls', 'application/vnd.ms-excel'],
  [FILE_TYPES.XLSX]: [
    'xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  [FILE_TYPES.PPT]: ['ppt', 'application/vnd.ms-powerpoint'],
  [FILE_TYPES.PPTX]: [
    'pptx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
} as const;

export const PDF_EXTENSIONS = ['.pdf'];
export const OFFICE_EXTENSIONS = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
export const SUPPORTED_EXTENSIONS = [...PDF_EXTENSIONS, ...OFFICE_EXTENSIONS];
export const OFFICE_ONLINE_VIEWER_URL = 'https://view.officeapps.live.com/op/embed.aspx';
