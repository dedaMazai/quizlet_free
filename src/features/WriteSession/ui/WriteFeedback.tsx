import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { Card, FavoriteToggle } from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useSpeech } from '@/shared/lib/hooks/useSpeech';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AnswerGrade } from '@/shared/lib/text';
import cls from './WriteSession.module.scss';

interface WriteFeedbackProps {
  card: Card;
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

export const WriteFeedback: FC<WriteFeedbackProps> = (props) => {
  const {
    card, grade, expected, userInput, onNext,
  } = props;
  const { t } = useTranslation();
  const { speak } = useSpeech();

  // Автоозвучка английского слова при показе фидбэка
  useEffect(() => {
    speak(card.term, 'en-US');
  }, [card.term, speak]);

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

      {grade !== 'correct' && userInput.trim() && (
        <MyTypography.Base type="secondary">
          {t('Ваш ответ')}: {userInput}
        </MyTypography.Base>
      )}

      <HStack gap="8" align="center">
        <MyTypography.Base type="secondary">{t('Правильный ответ')}:</MyTypography.Base>
        <MyTypography.Base strong>{expected}</MyTypography.Base>
        <SpeakButton text={card.term} />
        <FavoriteToggle cardUuid={card.uuid} />
      </HStack>

      {card.example && (
        <MyTypography.Base type="secondary" className={cls.example}>
          {card.example}
        </MyTypography.Base>
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
