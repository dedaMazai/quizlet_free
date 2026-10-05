import {
  FC, memo, MouseEvent, ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { useSpeech } from '@/shared/lib/hooks/useSpeech';

interface SpeakButtonProps {
  text: string;
  lang?: 'en-US' | 'ru-RU';
  className?: string;
  /** Своя иконка вместо SoundOutlined */
  icon?: ReactNode;
}

export const SpeakButton: FC<SpeakButtonProps> = memo((props) => {
  const {
    text, lang = 'en-US', className, icon,
  } = props;
  const { t } = useTranslation();
  const { speak, supported } = useSpeech();

  if (!supported) {
    return null;
  }

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    speak(text, lang);
  };

  return (
    <Button
      className={className}
      type="text"
      shape="circle"
      aria-label={t('Прослушать')}
      icon={icon ?? <SoundOutlined />}
      onClick={handleClick}
    />
  );
});
