import {
  FC, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, InputRef, Tooltip,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames/classNames';
import { CycleDirection } from '../model/lib/cycleEngine';
import cls from './CycleSession.module.scss';

interface CyclePromptProps {
  /** Ключ вопроса: при смене поле очищается. */
  questionKey: string;
  prompt: string;
  expected: string;
  direction: CycleDirection;
  onAnswer: (value: string) => void;
}

export const CyclePrompt: FC<CyclePromptProps> = (props) => {
  const {
    questionKey, prompt, expected, direction, onAnswer,
  } = props;
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [peeking, setPeeking] = useState(false);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    setValue('');
    setPeeking(false);
    inputRef.current?.focus();
  }, [questionKey]);

  const submit = () => {
    if (!value.trim()) return;
    onAnswer(value);
  };

  // Ответ виден только пока кнопка зажата; после отпускания — снова в поле ввода.
  const stopPeek = () => {
    setPeeking(false);
    inputRef.current?.focus();
  };

  return (
    <VStack max gap="16" align="center">
      <MyTypography.Small type="secondary">
        {direction === 'ru-en' ? t('Напишите слово по-английски') : t('Напишите перевод по-русски')}
      </MyTypography.Small>
      <MyTypography.ExtraLarge strong>{prompt}</MyTypography.ExtraLarge>

      <MyTypography.Base strong className={classNames(cls.peekAnswer, { [cls.visible]: peeking })}>
        {expected}
      </MyTypography.Base>

      <HStack max gap="8" className={cls.writeRow}>
        <Input
          ref={inputRef}
          size="large"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={(e) => {
            // Иначе тот же Enter активирует кнопку «Продолжить» на экране результата
            e.preventDefault();
            submit();
          }}
          placeholder={t('Введите ответ')}
          className={cls.answerInput}
          autoFocus
          // Мобильная клавиатура не должна «исправлять» ответ за пользователя.
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <Tooltip title={t('Удерживайте, чтобы подсмотреть')}>
          <Button
            size="large"
            icon={<EyeOutlined />}
            aria-label={t('Подсмотреть')}
            className={cls.peekButton}
            onPointerDown={() => setPeeking(true)}
            // Кнопка не забирает фокус у поля — иначе на телефоне закроется клавиатура.
            onMouseDown={(e) => e.preventDefault()}
            onPointerUp={stopPeek}
            onPointerLeave={() => setPeeking(false)}
            onPointerCancel={() => setPeeking(false)}
            onContextMenu={(e) => e.preventDefault()}
            // С клавиатуры — удерживать пробел или Enter на кнопке.
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setPeeking(true);
              }
            }}
            onKeyUp={() => setPeeking(false)}
            onBlur={() => setPeeking(false)}
          />
        </Tooltip>
        <Button type="primary" size="large" className={cls.rowButton} onClick={submit}>
          {t('Ответить')}
        </Button>
      </HStack>
    </VStack>
  );
};
