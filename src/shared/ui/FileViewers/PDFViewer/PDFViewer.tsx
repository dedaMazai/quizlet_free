import { FC, useState, useEffect } from 'react';
import { Result, Spin, Typography, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { VStack } from '@/shared/ui/Stack';
import { downloadImageFromSrc } from '@/shared/lib/utils';


export interface PDFViewerProps {
  fileUrl: string;
  filename: string;
}

const RESULT_STATUS = {
  INFO: 'info' as const,
  ERROR: 'error' as const,
};

export const PDFViewer: FC<PDFViewerProps> = (props) => {
  const { fileUrl, filename } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Для embed нет событий onLoad/onError, используем таймер
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Даем 2 секунды на загрузку

    return () => clearTimeout(timer);
  }, [fileUrl]);

  // // Мобильные устройства: показываем кнопку скачивания вместо iframe
  // if (isMobile) {
  //   return (
  //     <VStack 
  //       fullHeight 
  //       max 
  //       align="center" 
  //       justify="center" 
  //       gap="16"
  //     >
  //       <Result
  //         status={RESULT_STATUS.INFO}
  //         title={t('PDF документ')}
  //         subTitle={t('На мобильных устройствах PDF лучше открывать в отдельном приложении')}
  //         extra={
  //           <Button 
  //             type="primary" 
  //             icon={<DownloadOutlined />}
  //             onClick={() => downloadImageFromSrc(fileUrl, filename)}
  //             size="large"
  //           >
  //             {t('Открыть PDF')}
  //           </Button>
  //         }
  //       />
  //     </VStack>
  //   );
  // }

  if (hasError) {
    return (
      <Result
        status={RESULT_STATUS.ERROR}
        title={t('Не удалось загрузить PDF')}
        subTitle={t('Невозможно отобразить {{filename}}. Попробуйте скачать файл.', { filename })}
        extra={
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => downloadImageFromSrc(fileUrl, filename)}
          >
            {t('Скачать PDF')}
          </Button>
        }
      />
    );
  }

  return (
    <VStack fullHeight max>
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
          <Typography.Text>{t('Загрузка PDF...')}</Typography.Text>
        </VStack>
      )}
    
      <iframe
        title={filename}
        src={fileUrl}
        width="100%"
        height="100%"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        style={{ 
          border: 'none',
          display: isLoading ? 'none' : 'block',
          width: '100%',
          height: '100%',
          minWidth: '100%',
          maxWidth: '100%',
          minHeight: '100%',
          boxSizing: 'border-box',
          flex: '1 1 auto'
        }}
      />
      {/* <embed 
        src={fileUrl}
        width="100%"
        height="100%"
        type="application/pdf"
        style={{ 
          border: 'none',
          display: isLoading ? 'none' : 'block',
          width: '100%',
          height: '100%',
          minWidth: '100%',
          maxWidth: '100%',
          minHeight: '100%',
          boxSizing: 'border-box',
          flex: '1 1 auto'
        }}
      /> */}
    </VStack>
  );
};
