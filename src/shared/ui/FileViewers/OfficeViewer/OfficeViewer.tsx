import { FC, useState } from 'react';
import { Result, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { VStack } from '@/shared/ui/Stack';
import { OFFICE_ONLINE_VIEWER_URL } from '@/shared/lib/fileTypes';

export interface OfficeViewerProps {
  fileUrl: string;
  filename: string;
}

export const OfficeViewer: FC<OfficeViewerProps> = (props) => {
  const { fileUrl, filename } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <Result
        status="error"
        title={t('Не удалось загрузить документ')}
        subTitle={t(`Невозможно отобразить ${filename}. Попробуйте скачать файл.`)}
      />
    );
  }

  const viewerUrl = `${OFFICE_ONLINE_VIEWER_URL}?src=${encodeURIComponent(fileUrl)}`;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isLoading && (
        <VStack 
          gap="12"
          align="center" 
          justify="center"
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 1 
          }}
        >
          <Spin size="large" />
          <Typography.Text>{t('Загрузка документа...')}</Typography.Text>
        </VStack>
      )}
      <iframe
        id="office-iframe"
        title={`Office document viewer - ${filename}`}
        src={viewerUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};
