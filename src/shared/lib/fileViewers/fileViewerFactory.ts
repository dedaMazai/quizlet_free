import { lazy } from 'react';
import { getViewerType } from '@/shared/lib/fileTypes';
import {
  FileViewerResult,
  FileViewerComponentProps,
} from './types';

const PDFViewer = lazy(() =>
  import('@/shared/ui/FileViewers/PDFViewer').then(module => ({
    default: module.PDFViewer
  }))
);

const OfficeViewer = lazy(() =>
  import('@/shared/ui/FileViewers/OfficeViewer').then(module => ({
    default: module.OfficeViewer
  }))
);

const ImageViewer = lazy(() =>
  import('@/shared/ui/FileViewers/ImageViewer').then(module => ({
    default: module.ImageViewer
  }))
);

export const getFileViewer = (filename: string): FileViewerResult => {
  const viewerType = getViewerType(filename);

  switch (viewerType) {
    case 'pdf':
      return {
        viewerType: 'pdf',
        component: PDFViewer as React.ComponentType<FileViewerComponentProps>,
        isSupported: true,
      };

    case 'office':
      return {
        viewerType: 'office',
        component: OfficeViewer as React.ComponentType<FileViewerComponentProps>,
        isSupported: true,
      };

    case 'image':
      return {
        viewerType: 'image',
        component: ImageViewer as React.ComponentType<FileViewerComponentProps>,
        isSupported: true,
      };

    case 'unsupported':
    default:
      return {
        viewerType: 'unsupported',
        component: null,
        isSupported: false,
      };
  }
};
