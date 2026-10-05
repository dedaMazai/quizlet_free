import {
  FC, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { Volume2 } from 'lucide-react';
import { useLocalStorage } from '@/shared/lib/hooks/useLocalStorage';
import { pickVoice, useSpeech } from '@/shared/lib/hooks/useSpeech';
import { LOCAL_STORAGE_VOICE_KEY } from '@/shared/const/localstorage';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';
import cls from './VoiceSwitcher.module.scss';

const SAMPLE_WORD = 'airport';
const MAX_VOICES = 3;
const ICON_SIZE = 16;
const ICON_STROKE = 1.5;
/** Порядок регионов в сегментах: US · UK · AU, как в макете */
const REGION_ORDER = ['US', 'GB', 'AU'];

const getRegion = (voice: SpeechSynthesisVoice) => voice.lang.split(/[-_]/)[1]?.toUpperCase() ?? '';

/** «Samantha · US», «Daniel · UK»: имя без хвоста « - English (…)» / « (…)» */
const getVoiceLabel = (voice: SpeechSynthesisVoice) => {
  const name = voice.name.split(/\s+[-(]/)[0];
  const region = getRegion(voice);
  return region ? `${name} · ${region === 'GB' ? 'UK' : region}` : name;
};

/** До трёх английских голосов: по одному на регион из REGION_ORDER, остальное — по порядку */
const pickSegmentVoices = (voices: SpeechSynthesisVoice[], savedUri: string) => {
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const byRegion = REGION_ORDER
    .map((region) => en.find((v) => getRegion(v) === region))
    .filter((v): v is SpeechSynthesisVoice => Boolean(v));
  const rest = en.filter((v) => !byRegion.includes(v));
  const picked = [...byRegion, ...rest].slice(0, MAX_VOICES);

  // Выбранный ранее голос не теряем: подставляем его последним сегментом
  const saved = en.find((v) => v.voiceURI === savedUri);
  if (saved && !picked.includes(saved)) {
    picked[Math.min(picked.length, MAX_VOICES - 1)] = saved;
  }
  return picked;
};

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

  const segmentVoices = useMemo(() => pickSegmentVoices(voices, voiceURI), [voices, voiceURI]);

  if (!supported || !segmentVoices.length) {
    return null;
  }

  // Голос не выбран — подсвечиваем тот, что подберётся автоматически
  const activeUri = voiceURI || pickVoice('en-US')?.voiceURI;

  const handleChange = (value: string) => {
    setVoiceURI(value);
    speak(SAMPLE_WORD, 'en-US');
  };

  return (
    <div className={cls.VoiceSwitcher}>
      <BoxSegmented<string>
        value={activeUri}
        onChange={handleChange}
        options={segmentVoices.map((v) => ({ value: v.voiceURI, label: getVoiceLabel(v) }))}
      />
      <Button
        className={cls.play}
        aria-label={t('Прослушать')}
        icon={<Volume2 aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        onClick={() => speak(SAMPLE_WORD, 'en-US')}
      />
    </div>
  );
};
