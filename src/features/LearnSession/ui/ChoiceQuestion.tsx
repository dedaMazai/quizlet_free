import {
  FC, FocusEvent, KeyboardEvent, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { LearnQuestion } from '../model/lib/learnEngine';
import { FavoriteToggle } from '@/entities/Card';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './LearnSession.module.scss';

interface ChoiceQuestionProps {
  question: LearnQuestion;
  onAnswer: (value: string) => void;
}

/** Число колонок в сетке вариантов — на столько шагает выбор по вертикали. */
const COLUMNS = 2;

export const ChoiceQuestion: FC<ChoiceQuestionProps> = (props) => {
  const { question, onAnswer } = props;
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const btnRefs = useRef<(HTMLElement | null)[]>([]);

  // Новая карточка — снова первый вариант
  useEffect(() => {
    setActive(0);
  }, [question.card.uuid]);

  // Выбранный вариант держим в фокусе: тогда Enter и пробел нажимают его штатно,
  // без собственной обработки — и Enter с экрана результата не проскакивает вопрос
  useEffect(() => {
    btnRefs.current[active]?.focus({ preventScroll: true });
  }, [active, question.card.uuid]);

  // Клик по пустому месту уводит фокус в никуда, и хоткеи перестают работать —
  // возвращаем его на выбранный вариант. Осознанный уход (Tab, клик по меню)
  // приходит с relatedTarget и фокус не перехватывает
  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget) return;
    const root = e.currentTarget;
    // focus() прямо в обработчике focusout браузер игнорирует — возвращаем следующим тиком,
    // проверив, что фокус за это время не ушёл куда-то ещё и вопрос не сменился
    setTimeout(() => {
      const btn = btnRefs.current[active];
      if (!btn?.isConnected || root.contains(document.activeElement)) return;
      btn.focus({ preventScroll: true });
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const count = question.choices.length;

    const digit = Number(e.key);
    if (digit >= 1 && digit <= count) {
      e.preventDefault();
      onAnswer(question.choices[digit - 1]);
      return;
    }

    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -COLUMNS,
      ArrowDown: COLUMNS,
    };
    const delta = deltas[e.key];
    if (delta === undefined) return;

    // Иначе стрелки прокрутят страницу
    e.preventDefault();
    setActive((i) => (i + delta + count) % count);
  };

  return (
    <VStack max gap="16" align="center" onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <MyTypography.Small type="secondary">{t('Выберите перевод')}</MyTypography.Small>
      <HStack gap="8" align="center">
        <MyTypography.ExtraLarge strong>{question.card.translation}</MyTypography.ExtraLarge>
        <FavoriteToggle cardUuid={question.card.uuid} className={cls.favoriteLarge} />
      </HStack>

      <div className={cls.choices}>
        {question.choices.map((choice, index) => (
          <Button
            key={choice}
            ref={(node) => { btnRefs.current[index] = node; }}
            size="large"
            block
            className={classNames(cls.choiceBtn, { [cls.choiceActive]: index === active })}
            onClick={() => onAnswer(choice)}
          >
            <span className={cls.choiceIndex}>{index + 1}</span>
            {choice}
          </Button>
        ))}
      </div>
    </VStack>
  );
};
