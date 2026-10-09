// Слово, разобранное ИИ из вставленного списка.
export interface AiParsedWord {
  term: string;
  translation: string;
  example: string;
}

// Ответ Edge Function parse-words.
export interface AiParseWordsResult {
  results: AiParsedWord[];
  /** true, когда в тексте было больше слов, чем разбирается за один запрос. */
  truncated: boolean;
}
