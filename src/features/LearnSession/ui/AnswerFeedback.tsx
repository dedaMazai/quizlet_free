import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Card } from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useSpeech } from '@/shared/lib/hooks/useSpeech';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './LearnSession.module.scss';

interface AnswerFeedbackProps {
  card: Card;
  correct: boolean;
  userInput: string;
  onNext: () => void;
}

export const AnswerFeedback: FC<AnswerFeedbackProps> = (props) => {
  const {
    card, correct, userInput, onNext,
  } = props;
  const { t } = useTranslation();
  const { speak } = useSpeech();

  // Автоозвучка правильного слова при показе фидбэка
  useEffect(() => {
    speak(card.term, 'en-US');
  }, [card.term, speak]);

  return (
    <VStack max gap="16" align="center">
      <div className={classNames(cls.feedbackIcon, { [cls.correct]: correct, [cls.wrong]: !correct })}>
        {correct ? <CheckCircleFilled /> : <CloseCircleFilled />}
      </div>

      <MyTypography.Large strong>
        {correct ? t('Верно') : t('Неверно')}
      </MyTypography.Large>

      {!correct && userInput.trim() && (
        <MyTypography.Base type="secondary">
          {t('Ваш ответ')}: {userInput}
        </MyTypography.Base>
      )}

      <HStack gap="8" align="center">
        <MyTypography.Base type="secondary">{t('Правильный ответ')}:</MyTypography.Base>
        <MyTypography.Base strong>{card.term}</MyTypography.Base>
        <SpeakButton text={card.term} />
      </HStack>

      <Button type="primary" size="large" onClick={onNext} autoFocus>
        {t('Продолжить')}
      </Button>
    </VStack>
  );
};
