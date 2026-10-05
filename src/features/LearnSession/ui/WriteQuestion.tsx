import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputRef } from 'antd';
import { LearnQuestion } from '../model/lib/learnEngine';
import { FavoriteToggle } from '@/entities/Card';
import { AnswerInput } from '@/shared/ui/AnswerInput';
import { AnswerReveal, getRevealParts } from '@/shared/ui/AnswerReveal';
import { Kicker } from '@/shared/ui/Kicker';
import { SessionButton } from '@/shared/ui/SessionButton';
import { SessionNextButton } from '@/shared/ui/SessionNextButton';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './LearnSession.module.scss';

interface WriteQuestionProps {
  question: LearnQuestion;
  /** Ответ после проверки; null — вопрос ещё открыт */
  answered: { input: string; correct: boolean } | null;
  onAnswer: (value: string) => void;
  onNext: () => void;
}

export const WriteQuestion: FC<WriteQuestionProps> = (props) => {
  const {
    question, answered, onAnswer, onNext,
  } = props;
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  // Сброс и фокус при каждом новом вопросе — в том числе когда после ошибки
  // та же карточка идёт снова (компонент между вопросом и фидбэком не пересоздаётся)
  const isOpen = answered === null;
  useEffect(() => {
    if (!isOpen) return;
    setValue('');
    inputRef.current?.focus();
  }, [question.card.uuid, isOpen]);

  const submit = () => {
    if (!value.trim()) return;
    onAnswer(value);
  };

  const reveal = answered
    ? getRevealParts(question.card.term, answered.input, answered.correct ? 'correct' : 'wrong')
    : null;

  return (
    <>
      <div className={classNames(cls.prompt, [cls.writePrompt])}>
        <Kicker className={cls.kicker}>{t('Напишите по-английски')}</Kicker>
        <div className={cls.wordRow}>
          <span className={cls.writeWord}>{question.card.translation}</span>
          <FavoriteToggle cardUuid={question.card.uuid} className={cls.favorite} />
        </div>
      </div>

      <div className={cls.writeBody}>
        <AnswerInput
          inputRef={inputRef}
          value={value}
          onChange={setValue}
          onSubmit={submit}
          placeholder={t('Введите слово')}
          parts={reveal?.input}
        />
        {answered && reveal && (
          <AnswerReveal
            tone={reveal.tone}
            label={answered.correct ? t('Верно') : t('Неверно')}
            note={answered.correct ? undefined : t('Слово вернётся в эту же сессию')}
            answer={reveal.answer}
            speakText={question.card.term}
            example={question.card.example}
            term={question.card.term}
          />
        )}
      </div>

      <div className={cls.actions}>
        {answered ? (
          <SessionNextButton onNext={onNext} autoAdvance={answered.correct} className={cls.cta} />
        ) : (
          <SessionButton keyHint="ENTER" className={cls.cta} onClick={submit}>
            {t('Проверить')}
          </SessionButton>
        )}
      </div>
    </>
  );
};
