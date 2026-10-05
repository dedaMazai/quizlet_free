import {
  FC, useEffect, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Input, InputRef } from 'antd';
import { AnswerReveal, getRevealParts } from '@/shared/ui/AnswerReveal';
import { Kicker } from '@/shared/ui/Kicker';
import { SessionButton, SessionButtonVariant } from '@/shared/ui/SessionButton';
import { SessionNextButton } from '@/shared/ui/SessionNextButton';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AnswerGrade, damerauLevenshtein, normalize } from '@/shared/lib/text';
import { ClozeItem } from '../model/lib/clozeEngine';
import cls from './ClozeSession.module.scss';

interface ClozePromptProps {
  item: ClozeItem;
  typoTolerance: boolean;
  /** Оценка после проверки; null — вопрос ещё открыт */
  grade: AnswerGrade | null;
  userInput: string;
  correctNote?: string;
  onAnswer: (value: string) => void;
  onSkip: () => void;
  onNext: () => void;
}

/** Вариант ответа, ближайший к вводу, — с ним и сравниваем для подсветки */
const closestVariant = (variants: string[], input: string): string => variants.reduce(
  (best, variant) => (
    damerauLevenshtein(normalize(variant), normalize(input))
      < damerauLevenshtein(normalize(best), normalize(input)) ? variant : best
  ),
  variants[variants.length - 1],
);

export const ClozePrompt: FC<ClozePromptProps> = (props) => {
  const {
    item, typoTolerance, grade, userInput, correctNote, onAnswer, onSkip, onNext,
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
  }, [item.card.uuid, isOpen]);

  const submit = () => {
    if (!value.trim()) return;
    onAnswer(value);
  };

  const skip = () => {
    onSkip();
    inputRef.current?.focus();
  };

  const reveal = useMemo(() => {
    if (!grade) return null;
    const expected = closestVariant(item.expected, userInput);
    return getRevealParts(expected, userInput, grade);
  }, [grade, item.expected, userInput]);

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
        <Kicker className={cls.kicker}>{t('Вставьте слово по смыслу')}</Kicker>
        <div className={cls.sentence}>
          {item.before}
          {reveal ? (
            <span className={classNames(cls.gap, [cls.filled])}>
              {reveal.input.map((part, i) => (
                // Части ответа не переупорядочиваются — индекс стабилен
                <span key={i} className={classNames({ [cls.typo]: part.changed })}>{part.text}</span>
              ))}
            </span>
          ) : (
            <Input
              ref={inputRef}
              variant="borderless"
              className={cls.gap}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onPressEnter={(e) => {
                // Тот же Enter не должен сразу пролистать фидбэк
                e.preventDefault();
                submit();
              }}
              aria-label={t('Пропущенное слово')}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          )}
          {item.after}
        </div>
        {!grade && (
          <span className={cls.hint}>
            {t('Подсказка')}: <b className={cls.hintWord}>{item.card.translation}</b>
          </span>
        )}
      </div>

      {grade && reveal && (
        <AnswerReveal
          className={cls.reveal}
          tone={reveal.tone}
          label={labels[grade]}
          note={notes[grade]}
          answer={reveal.answer}
          speakText={item.card.term}
          example={item.card.example}
          term={item.expected[item.expected.length - 1]}
        />
      )}

      <div className={cls.actions}>
        {grade ? (
          <SessionNextButton onNext={onNext} autoAdvance={grade === 'correct'} />
        ) : (
          <>
            <SessionButton keyHint="ENTER" onClick={submit}>
              {t('Проверить')}
            </SessionButton>
            <SessionButton variant={SessionButtonVariant.GHOST} onClick={skip}>
              {t('Не помню')}
            </SessionButton>
          </>
        )}
      </div>

      {!grade && typoTolerance && (
        <span className={cls.note}>{t('Одна опечатка засчитывается — с пометкой «трудно».')}</span>
      )}
    </>
  );
};
