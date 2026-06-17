import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, InputRef } from 'antd';
import { LearnQuestion } from '../model/lib/learnEngine';
import { FavoriteToggle } from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import cls from './LearnSession.module.scss';

interface WriteQuestionProps {
  question: LearnQuestion;
  onAnswer: (value: string) => void;
}

export const WriteQuestion: FC<WriteQuestionProps> = (props) => {
  const { question, onAnswer } = props;
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  // Сброс и фокус при смене карточки
  useEffect(() => {
    setValue('');
    inputRef.current?.focus();
  }, [question.card.uuid]);

  const submit = () => {
    if (!value.trim()) return;
    onAnswer(value);
  };

  return (
    <VStack max gap="16" align="center">
      <MyTypography.Small type="secondary">{t('Напишите слово по-английски')}</MyTypography.Small>
      <HStack gap="8" align="center">
        <MyTypography.ExtraLarge strong>{question.card.translation}</MyTypography.ExtraLarge>
        <FavoriteToggle cardUuid={question.card.uuid} />
      </HStack>

      <HStack max gap="8" className={cls.writeRow}>
        <Input
          ref={inputRef}
          size="large"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={submit}
          placeholder={t('Введите слово')}
          autoFocus
        />
        <Button type="primary" size="large" onClick={submit}>
          {t('Ответить')}
        </Button>
      </HStack>
    </VStack>
  );
};
