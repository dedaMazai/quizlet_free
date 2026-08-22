import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, InputRef } from 'antd';
import { Card, FavoriteToggle } from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { WriteDirection } from '../model/lib/writeEngine';
import cls from './WriteSession.module.scss';

interface WritePromptProps {
  card: Card;
  prompt: string;
  direction: WriteDirection;
  onAnswer: (value: string) => void;
  onSkip: () => void;
}

export const WritePrompt: FC<WritePromptProps> = (props) => {
  const {
    card, prompt, direction, onAnswer, onSkip,
  } = props;
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  // Сброс и фокус при смене карточки
  useEffect(() => {
    setValue('');
    inputRef.current?.focus();
  }, [card.uuid]);

  const submit = () => {
    if (!value.trim()) return;
    onAnswer(value);
  };

  const skip = () => {
    onSkip();
    // При очереди из одной карточки скип — no-op, но фокус возвращаем всегда.
    inputRef.current?.focus();
  };

  return (
    <VStack max gap="16" align="center">
      <MyTypography.Small type="secondary">
        {direction === 'ru-en' ? t('Напишите слово по-английски') : t('Напишите перевод по-русски')}
      </MyTypography.Small>
      <HStack gap="8" align="center">
        <MyTypography.ExtraLarge strong>{prompt}</MyTypography.ExtraLarge>
        <FavoriteToggle cardUuid={card.uuid} className={cls.favoriteLarge} />
      </HStack>

      <HStack max gap="8" className={cls.writeRow}>
        <Input
          ref={inputRef}
          size="large"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={(e) => {
            // Гасим действие по умолчанию, иначе тот же Enter активирует
            // кнопку «Продолжить», получившую autoFocus на экране результата
            e.preventDefault();
            submit();
          }}
          placeholder={t('Введите слово')}
          autoFocus
        />
        <Button type="primary" size="large" onClick={submit}>
          {t('Ответить')}
        </Button>
      </HStack>

      <Button type="text" onClick={skip}>
        {t('Пропустить')}
      </Button>
    </VStack>
  );
};
