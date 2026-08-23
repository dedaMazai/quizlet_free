// Слово, для которого ИИ подбирает коллокации.
export interface AiChunkInput {
  uuid: string;
  term: string;
  translation: string;
}

// Одна подобранная фраза.
export interface AiChunk {
  term: string;
  translation: string;
  example: string;
}

// Коллокации, подобранные к одному слову.
export interface AiChunksResult {
  uuid: string;
  chunks: AiChunk[];
}
