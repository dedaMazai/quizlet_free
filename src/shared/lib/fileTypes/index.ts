export {
  FILE_TYPES,
  OFFICE_MIME_TYPES,
  PDF_EXTENSIONS,
  OFFICE_EXTENSIONS,
  IMAGE_EXTENSIONS,
  SUPPORTED_EXTENSIONS,
  OFFICE_ONLINE_VIEWER_URL,
} from './fileTypeDetection';

export type { FileType } from './fileTypeDetection';

export {
  getFileExtension,
  isViewableFile,
  isPdfFile,
  isOfficeFile,
  isImageFile,
  getFileType,
  getViewerType,
} from './fileTypeDetection';
