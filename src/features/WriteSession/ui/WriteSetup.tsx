import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Segmented, Switch } from 'antd';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { Kicker } from '@/shared/ui/Kicker';
import { SessionButton } from '@/shared/ui/SessionButton';
import { WriteDirection, WriteSettings } from '../model/lib/writeEngine';
import cls from './WriteSession.module.scss';

interface WriteSetupProps {
  defaults: WriteSettings;
  onStart: (settings: WriteSettings) => void;
}

export const WriteSetup: FC<WriteSetupProps> = (props) => {
  const { defaults, onStart } = props;
  const { t } = useTranslation();
  const [direction, setDirection] = useState<WriteDirection>(defaults.direction);
  const [typoTolerance, setTypoTolerance] = useState(defaults.typoTolerance);
  const { isMobile } = useMatchMedia();

  return (
    <>
      <Kicker>{t('Направление')}</Kicker>
      {/* На мобильном варианты в столбик: в строку не помещаются в 390px */}
      <Segmented<WriteDirection>
        size="large"
        block={isMobile}
        vertical={isMobile}
        value={direction}
        onChange={setDirection}
        options={[
          { label: t('Русский → английский'), value: 'ru-en' },
          { label: t('Английский → русский'), value: 'en-ru' },
        ]}
      />

      <label className={cls.switchRow}>
        <Switch checked={typoTolerance} onChange={setTypoTolerance} />
        {t('Засчитывать ответ с опечаткой')}
      </label>

      <SessionButton onClick={() => onStart({ direction, typoTolerance })}>
        {t('Начать')}
      </SessionButton>
    </>
  );
};
