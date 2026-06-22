// Карточка, отправляемая в Edge Function на проверку.
export interface AiCheckInput {
  uuid: string;
  term: string;
  translation: string;
}

// Результат проверки одной карточки, возвращённый ИИ.
export interface AiCheckResult {
  uuid: string;
  translation_ok: boolean;
  suggested_translation: string | null;
  example: string;
}
