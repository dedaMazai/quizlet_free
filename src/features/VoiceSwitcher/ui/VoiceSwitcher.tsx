import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { Volume2 } from 'lucide-react';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';
import { useVoiceOptions } from '../model/useVoiceOptions';
import cls from './VoiceSwitcher.module.scss';

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

export const VoiceSwitcher: FC = () => {
  const { t } = useTranslation();
  const {
    supported, options, activeUri, select, playSample,
  } = useVoiceOptions();

  if (!supported || !options.length) {
    return null;
  }

  return (
    <div className={cls.VoiceSwitcher}>
      <BoxSegmented<string>
        value={activeUri}
        onChange={select}
        options={options}
      />
      <Button
        className={cls.play}
        aria-label={t('Прослушать')}
        icon={<Volume2 aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        onClick={playSample}
      />
    </div>
  );
};
