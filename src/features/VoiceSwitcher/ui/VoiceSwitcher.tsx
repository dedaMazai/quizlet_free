import {
  FC, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Select } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { HStack } from '@/shared/ui/Stack';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { useSpeech } from '@/shared/lib/hooks/useSpeech';
import { LOCAL_STORAGE_VOICE_KEY } from '@/shared/const/localstorage';
import cls from './VoiceSwitcher.module.scss';

const SAMPLE_WORD = 'airport';

export const VoiceSwitcher: FC = () => {
  const { t } = useTranslation();
  const { speak, supported } = useSpeech();
  const [voiceURI, setVoiceURI] = useLocalStorage<string>(LOCAL_STORAGE_VOICE_KEY, '');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!supported) {
      return undefined;
    }
    const refresh = () => setVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.addEventListener('voiceschanged', refresh);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', refresh);
  }, [supported]);

  const options = useMemo(() => {
    const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    return [
      { value: '', label: t('Авто (женский)') },
      ...enVoices.map((v) => ({ value: v.voiceURI, label: v.name })),
    ];
  }, [voices, t]);

  // Если сохранённый голос недоступен на этом устройстве — показываем «Авто».
  const selectValue = options.some((o) => o.value === voiceURI) ? voiceURI : '';

  if (!supported) {
    return null;
  }

  const handleChange = (value: string) => {
    setVoiceURI(value);
    speak(SAMPLE_WORD, 'en-US');
  };

  return (
    <HStack gap="8" align="center" max>
      <Select
        className={cls.select}
        value={selectValue}
        options={options}
        onChange={handleChange}
      />
      <Button
        type="text"
        shape="circle"
        icon={<SoundOutlined />}
        onClick={() => speak(SAMPLE_WORD, 'en-US')}
      />
    </HStack>
  );
};
