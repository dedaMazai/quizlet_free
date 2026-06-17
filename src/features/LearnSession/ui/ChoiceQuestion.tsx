import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { LearnQuestion } from '../model/lib/learnEngine';
import { MyTypography } from '@/shared/ui/MyTypography';
import { VStack } from '@/shared/ui/Stack';
import cls from './LearnSession.module.scss';

interface ChoiceQuestionProps {
  question: LearnQuestion;
  onAnswer: (value: string) => void;
}

export const ChoiceQuestion: FC<ChoiceQuestionProps> = (props) => {
  const { question, onAnswer } = props;
  const { t } = useTranslation();

  return (
    <VStack max gap="16" align="center">
      <MyTypography.Small type="secondary">{t('Выберите перевод')}</MyTypography.Small>
      <MyTypography.ExtraLarge strong>{question.card.translation}</MyTypography.ExtraLarge>

      <div className={cls.choices}>
        {question.choices.map((choice) => (
          <Button
            key={choice}
            size="large"
            block
            className={cls.choiceBtn}
            onClick={() => onAnswer(choice)}
          >
            {choice}
          </Button>
        ))}
      </div>
    </VStack>
  );
};
