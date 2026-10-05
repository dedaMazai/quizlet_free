import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LearnQuestion } from '../model/lib/learnEngine';
import { FavoriteToggle } from '@/entities/Card';
import { AnswerOption, AnswerOptionState } from '@/shared/ui/AnswerOption';
import { Kicker } from '@/shared/ui/Kicker';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';
import { splitTranslation } from '@/shared/lib/session';
import cls from './LearnSession.module.scss';

interface ChoiceQuestionProps {
  question: LearnQuestion;
  /** Выбранный вариант после ответа; null — вопрос ещё открыт */
  chosen: string | null;
  onAnswer: (value: string) => void;
}

/** Число колонок в сетке вариантов — на столько шагает выбор по вертикали. */
const COLUMNS = 2;

const ARROW_DELTAS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -COLUMNS,
  ArrowDown: COLUMNS,
};

export const ChoiceQuestion: FC<ChoiceQuestionProps> = (props) => {
  const { question, chosen, onAnswer } = props;
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const answered = chosen !== null;
  const [word, gloss] = splitTranslation(question.card.translation);

  // Новая карточка — снова первый вариант
  useEffect(() => {
    setActive(0);
  }, [question.card.uuid]);

  // 1–4 — ответ, стрелки — выбор, Enter — подтвердить выбранный
  useKeyDown((e) => {
    const count = question.choices.length;
    const digit = Number(e.key);
    if (digit >= 1 && digit <= count) {
      e.preventDefault();
      onAnswer(question.choices[digit - 1]);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onAnswer(question.choices[active]);
      return;
    }
    const delta = ARROW_DELTAS[e.key];
    if (delta === undefined) return;
    // Иначе стрелки прокрутят страницу
    e.preventDefault();
    setActive((i) => (i + delta + count) % count);
  }, { enabled: !answered });

  const stateOf = (choice: string, index: number): AnswerOptionState => {
    if (!answered) return index === active ? AnswerOptionState.ACTIVE : AnswerOptionState.IDLE;
    if (choice === question.card.term) return AnswerOptionState.CORRECT;
    if (choice === chosen) return AnswerOptionState.WRONG;
    return AnswerOptionState.DIM;
  };

  return (
    <>
      <div className={cls.prompt}>
        <Kicker>{t('Выберите перевод')}</Kicker>
        <div className={cls.wordRow}>
          <span className={cls.word}>{word}</span>
          <FavoriteToggle cardUuid={question.card.uuid} className={cls.favorite} />
        </div>
        {gloss && <span className={cls.gloss}>{gloss}</span>}
      </div>

      <div className={cls.choices}>
        {question.choices.map((choice, index) => (
          <AnswerOption
            key={choice}
            index={index + 1}
            label={choice}
            state={stateOf(choice, index)}
            disabled={answered}
            onClick={() => onAnswer(choice)}
          />
        ))}
      </div>

      {!answered && (
        <div className={cls.hints}>
          <span>{t('1–4 — ответ')}</span>
          <span>{t('← → ↑ ↓ — выбор')}</span>
          <span>{t('Enter — подтвердить')}</span>
        </div>
      )}
    </>
  );
};
