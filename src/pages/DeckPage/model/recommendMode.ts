/** Режимы занятий колоды в сетке «Как учить» (в порядке показа). */
export enum StudyMode {
  LEARN = 'learn',
  WRITE = 'write',
  CLOZE = 'cloze',
  ORDER = 'order',
  CARDS = 'cards',
}

export const STUDY_MODES: StudyMode[] = [
  StudyMode.LEARN,
  StudyMode.WRITE,
  StudyMode.CLOZE,
  StudyMode.ORDER,
  StudyMode.CARDS,
];

interface RecommendModeArgs {
  /** Слов без изучения */
  newCount: number;
  /** Слов, которые пора повторить */
  dueCount: number;
  /** Слов с примером — материал для «Пропусков» */
  examplesCount: number;
}

/**
 * Какой режим «РЕКОМЕНДУЕМ»: пока есть новые или долг — заучивание;
 * всё изучено — закрепление в контексте (пропуски), без примеров — письмо.
 */
export const recommendMode = (args: RecommendModeArgs): StudyMode => {
  const { newCount, dueCount, examplesCount } = args;
  if (newCount > 0 || dueCount > 0) return StudyMode.LEARN;
  if (examplesCount > 0) return StudyMode.CLOZE;
  return StudyMode.WRITE;
};
