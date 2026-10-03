import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { CycleWord } from '@/entities/LearningCycle';
import { MyTypography } from '@/shared/ui/MyTypography';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AnswerGrade } from '@/shared/lib/text';
import cls from './CycleSession.module.scss';

interface CycleFeedbackProps {
  word: CycleWord;
  grade: AnswerGrade;
  expected: string;
  userInput: string;
  onNext: () => void;
}

const gradeIcons = {
  correct: <CheckCircleFilled />,
  almost: <ExclamationCircleFilled />,
  wrong: <CloseCircleFilled />,
};

export const CycleFeedback: FC<CycleFeedbackProps> = (props) => {
  const {
    word, grade, expected, userInput, onNext,
  } = props;
  const { t } = useTranslation();

  const gradeTitles: Record<AnswerGrade, string> = {
    correct: t('Верно'),
    almost: t('Почти верно'),
    wrong: t('Неверно'),
  };

  return (
    <VStack max gap="16" align="center">
      <div className={classNames(cls.feedbackIcon, [cls[grade]])}>
        {gradeIcons[grade]}
      </div>

      <MyTypography.Large strong>{gradeTitles[grade]}</MyTypography.Large>

      {grade !== 'correct' && (
        <MyTypography.Base type="secondary">
          {t('Ваш ответ')}: {userInput}
        </MyTypography.Base>
      )}

      <HStack gap="8" align="center">
        <MyTypography.Base type="secondary">{t('Правильный ответ')}:</MyTypography.Base>
        <MyTypography.Base strong>{expected}</MyTypography.Base>
        <SpeakButton text={word.term} />
      </HStack>

      {grade === 'wrong' && (
        <MyTypography.Small type="secondary">
          {t('Слово повторится в конце прохода')}
        </MyTypography.Small>
      )}

      <Button
        type="primary"
        size="large"
        onClick={onNext}
        autoFocus
        onKeyDown={(e) => {
          // Автоповтор удерживаемого Enter не должен пролистывать результат
          if (e.repeat) e.preventDefault();
        }}
      >
        {t('Продолжить')}
      </Button>
    </VStack>
  );
};
