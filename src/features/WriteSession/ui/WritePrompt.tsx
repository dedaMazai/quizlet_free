import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputRef } from 'antd';
import { Card, FavoriteToggle } from '@/entities/Card';
import { AnswerInput } from '@/shared/ui/AnswerInput';
import { AnswerReveal, getRevealParts } from '@/shared/ui/AnswerReveal';
import { Kicker } from '@/shared/ui/Kicker';
import { SessionButton, SessionButtonVariant } from '@/shared/ui/SessionButton';
import { SessionNextButton } from '@/shared/ui/SessionNextButton';
import { AnswerGrade } from '@/shared/lib/text';
import { WriteDirection } from '../model/lib/writeEngine';
import cls from './WriteSession.module.scss';

interface WritePromptProps {
  card: Card;
  prompt: string;
  expected: string;
  direction: WriteDirection;
  /** Оценка после проверки; null — вопрос ещё открыт */
  grade: AnswerGrade | null;
  userInput: string;
  /** Подпись к верному ответу: «Интервал вырос…» */
  correctNote?: string;
  onAnswer: (value: string) => void;
  onSkip: () => void;
  onNext: () => void;
  /** «Я ответил верно» — засчитать неверный/почти верный ответ как верный */
  onAcceptCorrect: () => void;
}

export const WritePrompt: FC<WritePromptProps> = (props) => {
  const {
    card, prompt, expected, direction, grade, userInput, correctNote, onAnswer, onSkip, onNext, onAcceptCorrect,
  } = props;
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  // Сброс и фокус при каждом новом вопросе — в том числе когда после ошибки
  // та же карточка идёт снова (компонент между вопросом и фидбэком не пересоздаётся)
  const isOpen = grade === null;
  useEffect(() => {
    if (!isOpen) return;
    setValue('');
    inputRef.current?.focus();
  }, [card.uuid, isOpen]);

  const submit = () => {
    if (!value.trim()) return;
    onAnswer(value);
  };

  const skip = () => {
    onSkip();
    // При очереди из одной карточки скип — no-op, но фокус возвращаем всегда.
    inputRef.current?.focus();
  };

  const reveal = grade ? getRevealParts(expected, userInput, grade) : null;
  const labels: Record<AnswerGrade, string> = {
    correct: t('Верно'),
    almost: t('Почти · одна опечатка'),
    wrong: t('Неверно'),
  };
  const notes: Record<AnswerGrade, string | undefined> = {
    correct: correctNote,
    almost: t('засчитано как «трудно»'),
    wrong: t('Слово вернётся в эту же сессию'),
  };

  return (
    <>
      <div className={cls.prompt}>
        <Kicker className={cls.kicker}>
          {direction === 'ru-en' ? t('Напишите по-английски') : t('Напишите по-русски')}
        </Kicker>
        <div className={cls.wordRow}>
          <span className={cls.word}>{prompt}</span>
          <FavoriteToggle cardUuid={card.uuid} className={cls.favorite} />
        </div>
      </div>

      <div className={cls.body}>
        <AnswerInput
          inputRef={inputRef}
          value={value}
          onChange={setValue}
          onSubmit={submit}
          placeholder={t('Введите слово')}
          parts={reveal?.input}
        />
        {grade && reveal && (
          <AnswerReveal
            tone={reveal.tone}
            label={labels[grade]}
            note={notes[grade]}
            answer={reveal.answer}
            speakText={card.term}
            example={card.example}
            term={card.term}
          />
        )}
      </div>

      <div className={cls.actions}>
        {grade ? (
          <>
            <SessionNextButton onNext={onNext} autoAdvance={grade === 'correct'} className={cls.cta} />
            {grade !== 'correct' && (
              <SessionButton variant={SessionButtonVariant.GHOST} onClick={onAcceptCorrect}>
                {t('Я ответил верно')}
              </SessionButton>
            )}
          </>
        ) : (
          <>
            <SessionButton keyHint="ENTER" className={cls.cta} onClick={submit}>
              {t('Проверить')}
            </SessionButton>
            <SessionButton variant={SessionButtonVariant.GHOST} onClick={skip}>
              {t('Пропустить')}
            </SessionButton>
          </>
        )}
      </div>
    </>
  );
};
