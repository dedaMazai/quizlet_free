import { FC, Suspense, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography, Spin, Result, Modal } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { HStack, VStack } from '@/shared/ui/Stack';
import { getFileViewer } from '@/shared/lib/fileViewers/fileViewerFactory';
import { downloadImageFromSrc } from '@/shared/lib/utils';
import { MyTypography } from '../MyTypography';

export interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  filename: string;
}

export const canViewFile = (filename: string): boolean => {
  const result = getFileViewer(filename);
  return result.isSupported;
};

export const FileViewerModal: FC<FileViewerModalProps> = (props) => {
  const { isOpen, onClose, fileUrl, filename } = props;
  const { t } = useTranslation();

  const handleDownload = useCallback(() => {
    downloadImageFromSrc(fileUrl, filename);
  }, [fileUrl, filename]);

  const fileViewer = getFileViewer(filename);
  const isViewable = canViewFile(filename);

  // Error fallback component
  const ErrorFallback: FC = () => (
    <Result
      icon={<EyeOutlined style={{ fontSize: '64px', color: 'var(--text-secondary)' }} />}
      title={t('Невозможно просмотреть файл')}
      subTitle={t('Этот тип файла не поддерживается для предварительного просмотра. Вы можете скачать его вместо этого.')}
      extra={
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
        >
          {t('Скачать файл')}
        </Button>
      }
    />
  );

  // Loading fallback component
  const LoadingFallback: FC = () => (
    <VStack
      gap="16"
      align="center"
      justify="center"
      style={{ height: '100%', minHeight: '200px' }}
    >
      <Spin size="large" />
      <Typography.Text>
        {t('Загрузка файла...')}
      </Typography.Text>
    </VStack>
  );

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <MyTypography.Base type="secondary">
          {filename}
        </MyTypography.Base>
      }
      width="90vw"
      style={{ top: 20 }}
      styles={{
        body: {
          padding: 0,
          height: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
      footer={
        <HStack
          gap="12"
          justify="between"
          align="center"
        >
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            {t('Используйте кнопку скачивания при проблемах с просмотром')}
          </Typography.Text>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            {t('Скачать')}
          </Button>
        </HStack>
      }
      destroyOnHidden
    >
      {/* Viewer Content */}
      <div style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--hover-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {!isViewable ? (
          <ErrorFallback />
        ) : (
          <Suspense fallback={<LoadingFallback />}>
            {fileViewer.component && (
              <fileViewer.component
                fileUrl={fileUrl}
                filename={filename}
              />
            )}
          </Suspense>
        )}
      </div>
    </Modal>
  );
};
