import { FC, memo, MouseEvent } from 'react';
import { Button } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { useSpeech } from '@/shared/lib/hooks/useSpeech';

interface SpeakButtonProps {
  text: string;
  lang?: 'en-US' | 'ru-RU';
  className?: string;
}

export const SpeakButton: FC<SpeakButtonProps> = memo((props) => {
  const { text, lang = 'en-US', className } = props;
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
      icon={<SoundOutlined />}
      onClick={handleClick}
    />
  );
});
