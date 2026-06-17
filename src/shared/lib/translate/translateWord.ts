/** Пара языков для перевода: домен приложения — изучение английского. */
export const LANG_PAIR = 'en|ru';

interface MyMemoryResponse {
  responseData?: { translatedText?: string };
  responseStatus?: number;
}

/**
 * Переводит слово через бесплатный публичный API MyMemory (без ключа, прямо из
 * браузера). Возвращает перевод или `null` при ошибке/пустом ответе/rate-limit —
 * в этом случае пользователь вводит перевод вручную (без исключений).
 */
export const translateWord = async (text: string): Promise<string | null> => {
  const query = text.trim();
  if (!query) {
    return null;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=${LANG_PAIR}`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as MyMemoryResponse;
    if (data.responseStatus !== 200) {
      return null;
    }

    const translated = data.responseData?.translatedText?.trim();
    return translated || null;
  } catch {
    return null;
  }
};
