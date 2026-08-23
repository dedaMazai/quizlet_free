import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, InputRef } from 'antd';
import { FavoriteToggle } from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { ClozeItem } from '../model/lib/clozeEngine';
import cls from './ClozeSession.module.scss';

interface ClozePromptProps {
  item: ClozeItem;
  onAnswer: (value: string) => void;
  onSkip: () => void;
}

export const ClozePrompt: FC<ClozePromptProps> = (props) => {
  const { item, onAnswer, onSkip } = props;
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [hintShown, setHintShown] = useState(false);
  const inputRef = useRef<InputRef>(null);

  // Сброс и фокус при смене карточки
  useEffect(() => {
    setValue('');
    setHintShown(false);
    inputRef.current?.focus();
  }, [item.card.uuid]);

  const submit = () => {
    if (!value.trim()) return;
    onAnswer(value);
  };

  return (
    <VStack max gap="16" align="center">
      <MyTypography.Small type="secondary">
        {t('Вставьте пропущенное слово')}
      </MyTypography.Small>

      <MyTypography.Large className={cls.sentence}>
        {item.before}
        <span className={cls.gap} />
        {item.after}
      </MyTypography.Large>

      <HStack max gap="8" className={cls.answerRow}>
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

      <HStack gap="12" align="center">
        {hintShown ? (
          <HStack gap="8" align="center">
            <MyTypography.Base type="secondary">{item.card.translation}</MyTypography.Base>
            <FavoriteToggle cardUuid={item.card.uuid} />
          </HStack>
        ) : (
          <Button type="text" onClick={() => setHintShown(true)}>
            {t('Подсказка')}
          </Button>
        )}
        <Button type="text" onClick={onSkip}>
          {t('Пропустить')}
        </Button>
      </HStack>
    </VStack>
  );
};
