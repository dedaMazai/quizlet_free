import {
  FC, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputRef, Tooltip } from 'antd';
import { Eye } from 'lucide-react';
import { AnswerInput } from '@/shared/ui/AnswerInput';
import { AnswerReveal, getRevealParts } from '@/shared/ui/AnswerReveal';
import { Kicker } from '@/shared/ui/Kicker';
import { SessionButton } from '@/shared/ui/SessionButton';
import { SessionNextButton } from '@/shared/ui/SessionNextButton';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AnswerGrade } from '@/shared/lib/text';
import { CycleDirection } from '../model/lib/cycleEngine';
import cls from './CycleSession.module.scss';

const PEEK_ICON_SIZE = 18;
const PEEK_ICON_STROKE = 1.5;

interface CyclePromptProps {
  /** Ключ вопроса: при смене поле очищается. */
  questionKey: string;
  prompt: string;
  expected: string;
  /** Английское слово — для озвучки */
  term: string;
  direction: CycleDirection;
  /** Оценка после проверки; null — вопрос ещё открыт */
  grade: AnswerGrade | null;
  userInput: string;
  onAnswer: (value: string) => void;
  onNext: () => void;
}

export const CyclePrompt: FC<CyclePromptProps> = (props) => {
  const {
    questionKey, prompt, expected, term, direction, grade, userInput, onAnswer, onNext,
  } = props;
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [peeking, setPeeking] = useState(false);
  const inputRef = useRef<InputRef>(null);

  // Сброс и фокус при каждом новом вопросе — в том числе когда после ошибки
  // то же слово идёт снова (компонент между вопросом и фидбэком не пересоздаётся)
  const isOpen = grade === null;
  useEffect(() => {
    if (!isOpen) return;
    setValue('');
    setPeeking(false);
    inputRef.current?.focus();
  }, [questionKey, isOpen]);

  const submit = () => {
    if (!value.trim()) return;
    onAnswer(value);
  };

  // Ответ виден только пока кнопка зажата; после отпускания — снова в поле ввода.
  const stopPeek = () => {
    setPeeking(false);
    inputRef.current?.focus();
  };

  const reveal = grade ? getRevealParts(expected, userInput, grade) : null;
  const labels: Record<AnswerGrade, string> = {
    correct: t('Верно'),
    almost: t('Почти · одна опечатка'),
    wrong: t('Неверно'),
  };

  return (
    <>
      <div className={cls.prompt}>
        <Kicker className={cls.kicker}>
          {direction === 'ru-en' ? t('Напишите по-английски') : t('Напишите по-русски')}
        </Kicker>
        <span className={cls.word}>{prompt}</span>
      </div>

      <div className={cls.body}>
        {!grade && (
          <span className={classNames(cls.peekAnswer, { [cls.visible]: peeking })}>
            {expected}
          </span>
        )}
        <AnswerInput
          inputRef={inputRef}
          value={value}
          onChange={setValue}
          onSubmit={submit}
          placeholder={t('Введите ответ')}
          parts={reveal?.input}
        />
        {grade && reveal && (
          <AnswerReveal
            tone={reveal.tone}
            label={labels[grade]}
            note={grade === 'wrong' ? t('Слово повторится в конце прохода') : undefined}
            answer={reveal.answer}
            speakText={term}
          />
        )}
      </div>

      <div className={cls.actions}>
        {grade ? (
          <SessionNextButton onNext={onNext} autoAdvance={grade === 'correct'} className={cls.cta} />
        ) : (
          <>
            <SessionButton keyHint="ENTER" className={cls.cta} onClick={submit}>
              {t('Проверить')}
            </SessionButton>
            <Tooltip title={t('Удерживайте, чтобы подсмотреть')}>
              <Button
                icon={<Eye size={PEEK_ICON_SIZE} strokeWidth={PEEK_ICON_STROKE} />}
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
          </>
        )}
      </div>
    </>
  );
};
