export type {
    PracticeTask, GenerateExercisesArgs, CheckAnswersItem, AiCheckResultItem, AiCheckResponse,
} from './model/types/grammarPractice';
export {
    useGenerateGrammarExercisesMutation,
    useCheckGrammarAnswersMutation,
} from './model/api/grammarPracticeApi';
