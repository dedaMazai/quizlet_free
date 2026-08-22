import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Segmented, Switch } from 'antd';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { WriteDirection, WriteSettings } from '../model/lib/writeEngine';

interface WriteSetupProps {
  defaults: WriteSettings;
  onStart: (settings: WriteSettings) => void;
}

export const WriteSetup: FC<WriteSetupProps> = (props) => {
  const { defaults, onStart } = props;
  const { t } = useTranslation();
  const [direction, setDirection] = useState<WriteDirection>(defaults.direction);
  const [typoTolerance, setTypoTolerance] = useState(defaults.typoTolerance);

  return (
    <VStack max gap="24" align="center">
      <Segmented<WriteDirection>
        size="large"
        value={direction}
        onChange={setDirection}
        options={[
          { label: t('Русский → английский'), value: 'ru-en' },
          { label: t('Английский → русский'), value: 'en-ru' },
        ]}
      />

      <HStack gap="8" align="center">
        <Switch checked={typoTolerance} onChange={setTypoTolerance} />
        <MyTypography.Base>{t('Засчитывать ответ с опечаткой')}</MyTypography.Base>
      </HStack>

      <Button
        type="primary"
        size="large"
        onClick={() => onStart({ direction, typoTolerance })}
      >
        {t('Начать')}
      </Button>
    </VStack>
  );
};
