import { FC } from 'react';
import { Image, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { FileViewerComponentProps } from '@/shared/lib/fileViewers/types';
import { VStack } from '@/shared/ui/Stack';

export const ImageViewer: FC<FileViewerComponentProps> = ({ fileUrl, filename }) => {
  const { t } = useTranslation();

  return (
    <Image
      src={fileUrl}
      alt={filename}
      preview={{
        mask: false,
      }}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
      }}
      placeholder={
        <VStack 
          align="center" 
          justify="center"
          style={{ height: '200px' }}
        >
          <Spin size="large" />
          <span style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
            {t('Загрузка изображения...')}
          </span>
        </VStack>
      }
    />
  );
};
