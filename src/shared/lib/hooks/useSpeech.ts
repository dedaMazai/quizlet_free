import { useCallback, useMemo } from 'react';
import { LOCAL_STORAGE_VOICE_KEY } from '@/shared/const/localstorage';

type SpeechLang = 'en-US' | 'ru-RU';

const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * Имена известных женских голосов на разных платформах (macOS / Windows / Chrome).
 * В Web Speech API нет признака пола, поэтому выбираем по имени с запасным вариантом.
 */
const FEMALE_VOICE_HINTS = [
  'female',
  'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'serena', // macOS en
  'zira', 'aria', 'jenny', 'michelle', // Windows en
  'google us english', 'google uk english female', // Chrome en
  'milena', 'katya', 'alena', 'irina', // ru female
];

// Голоса грузятся асинхронно — кэшируем и обновляем по событию voiceschanged.
let cachedVoices: SpeechSynthesisVoice[] = [];
if (isSupported) {
  const refresh = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  refresh();
  window.speechSynthesis.addEventListener('voiceschanged', refresh);
}

/** Голос, выбранный пользователем в настройках (localStorage), либо '' — авто. */
const getSavedVoiceUri = (): string => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VOICE_KEY);
    return raw ? (JSON.parse(raw) as string) : '';
  } catch {
    return '';
  }
};

/**
 * Подбирает голос под язык:
 * 1) выбранный пользователем (если есть и подходит по языку),
 * 2) иначе женский по имени,
 * 3) иначе первый подходящий по языку.
 */
const pickVoice = (lang: SpeechLang): SpeechSynthesisVoice | undefined => {
  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  const langPrefix = lang.split('-')[0];

  const savedUri = getSavedVoiceUri();
  if (savedUri) {
    const chosen = voices.find((v) => v.voiceURI === savedUri);
    if (chosen && chosen.lang.toLowerCase().startsWith(langPrefix)) {
      return chosen;
    }
  }

  const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

  const female = matching.find((v) =>
    FEMALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint)));

  return female ?? matching[0];
};

/**
 * Обёртка над Web Speech API (window.speechSynthesis) для произношения слов.
 * Бэкенд и аудиофайлы не нужны. Если API не поддерживается — `supported = false`.
 * Учитывает выбранный в настройках голос, иначе предпочитает женский.
 */
export const useSpeech = () => {
  const speak = useCallback((text: string, lang: SpeechLang = 'en-US') => {
    if (!isSupported || !text.trim()) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voice = pickVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  return useMemo(() => ({ speak, supported: isSupported }), [speak]);
};
