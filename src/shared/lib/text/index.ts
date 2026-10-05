export type { AnswerGrade, AnswerDiff, DiffPart } from './answerGrading';
export {
  MIN_TYPO_LENGTH,
  normalize,
  damerauLevenshtein,
  checkAnswer,
  checkAnswerVariants,
  diffAnswer,
} from './answerGrading';
