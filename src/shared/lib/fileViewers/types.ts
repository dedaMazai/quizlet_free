
/**
 * Common interface for file viewer components
 */
export interface FileViewerComponentProps {
  fileUrl: string;
  filename: string;
}

/**
 * File viewer types supported by the system
 */
export type ViewerType = 'pdf' | 'office' | 'image' | 'unsupported';

/**
 * File viewer configuration for the factory
 */
export interface FileViewerConfig {
  viewerType: ViewerType;
  component: React.ComponentType<FileViewerComponentProps>;
  supportedExtensions: string[];
}

/**
 * File viewer factory result
 */
export interface FileViewerResult {
  viewerType: ViewerType;
  component: React.ComponentType<FileViewerComponentProps> | null;
  isSupported: boolean;
}
