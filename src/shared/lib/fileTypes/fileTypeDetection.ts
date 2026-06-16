export const FILE_TYPES = {
  PDF: 'pdf',
  DOC: 'doc',
  DOCX: 'docx',
  XLS: 'xls',
  XLSX: 'xlsx',
  PPT: 'ppt',
  PPTX: 'pptx',
  // Image types
  JPG: 'jpg',
  JPEG: 'jpeg',
  PNG: 'png',
  GIF: 'gif',
  BMP: 'bmp',
  WEBP: 'webp',
  SVG: 'svg',
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
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
export const SUPPORTED_EXTENSIONS = [...PDF_EXTENSIONS, ...OFFICE_EXTENSIONS, ...IMAGE_EXTENSIONS];
export const OFFICE_ONLINE_VIEWER_URL = 'https://view.officeapps.live.com/op/embed.aspx';


export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return filename.substring(lastDotIndex).toLowerCase();
};

export const isViewableFile = (filename: string): boolean => {
  const extension = getFileExtension(filename);
  return SUPPORTED_EXTENSIONS.includes(extension);
};

export const isPdfFile = (filename: string): boolean => {
  const extension = getFileExtension(filename);
  return PDF_EXTENSIONS.includes(extension);
};

export const isOfficeFile = (filename: string): boolean => {
  const extension = getFileExtension(filename);
  return OFFICE_EXTENSIONS.includes(extension);
};

export const isImageFile = (filename: string): boolean => {
  const extension = getFileExtension(filename);
  return IMAGE_EXTENSIONS.includes(extension);
};

export const getFileType = (filename: string): FileType | null => {
  const extension = getFileExtension(filename);
  
  switch (extension) {
    case '.pdf':
      return FILE_TYPES.PDF;
    case '.doc':
      return FILE_TYPES.DOC;
    case '.docx':
      return FILE_TYPES.DOCX;
    case '.xls':
      return FILE_TYPES.XLS;
    case '.xlsx':
      return FILE_TYPES.XLSX;
    case '.ppt':
      return FILE_TYPES.PPT;
    case '.pptx':
      return FILE_TYPES.PPTX;
    case '.jpg':
      return FILE_TYPES.JPG;
    case '.jpeg':
      return FILE_TYPES.JPEG;
    case '.png':
      return FILE_TYPES.PNG;
    case '.gif':
      return FILE_TYPES.GIF;
    case '.bmp':
      return FILE_TYPES.BMP;
    case '.webp':
      return FILE_TYPES.WEBP;
    case '.svg':
      return FILE_TYPES.SVG;
    default:
      return null;
  }
};

export const getViewerType = (filename: string): 'pdf' | 'office' | 'image' | 'unsupported' => {
  if (isPdfFile(filename)) {
    return 'pdf';
  }
  
  if (isOfficeFile(filename)) {
    return 'office';
  }
  
  if (isImageFile(filename)) {
    return 'image';
  }
  
  return 'unsupported';
};
