import { useCallback, useMemo } from 'react';

type SpeechLang = 'en-US' | 'ru-RU';

const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * Обёртка над Web Speech API (window.speechSynthesis) для произношения слов.
 * Бэкенд и аудиофайлы не нужны. Если API не поддерживается — `supported = false`.
 */
export const useSpeech = () => {
  const speak = useCallback((text: string, lang: SpeechLang = 'en-US') => {
    if (!isSupported || !text.trim()) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.startsWith(lang.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  return useMemo(() => ({ speak, supported: isSupported }), [speak]);
};
