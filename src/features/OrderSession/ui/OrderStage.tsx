import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGroup, motion } from 'motion/react';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker } from '@/shared/ui/Kicker';
import { SessionButton, SessionButtonSize, SessionButtonVariant } from '@/shared/ui/SessionButton';
import { EASE, MOTION_MS } from '@/shared/const/motion';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';
import { useReducedMotion } from '@/shared/lib/hooks/useReducedMotion';
import { remainingBank } from '../model/hooks/useOrderSession';
import { OrderItem } from '../model/lib/orderEngine';
import cls from './OrderSession.module.scss';

interface OrderStageProps {
  item: OrderItem;
  answer: string[];
  /** После проверки строка ответа только для чтения, банк и кнопки скрыты */
  checked: boolean;
  onPick: (index: number) => void;
  onUnpick: (index: number) => void;
  onCheck: () => void;
}

/** Какие ячейки банка заняты словами ответа — по позициям ответа */
interface Slots {
  item: OrderItem;
  bankIndexes: number[];
}

const FLIP_TRANSITION = { duration: MOTION_MS.base / 1000, ease: EASE.standard };
const FADE_TRANSITION = { duration: MOTION_MS.instant / 1000, ease: 'linear' } as const;

/** Без истории кликов (повторы слов, внешний сброс) — первые свободные ячейки с тем же словом */
const deriveBankIndexes = (bank: string[], answer: string[]): number[] => {
  const taken = new Set<number>();
  return answer.map((word) => {
    const at = bank.findIndex((candidate, index) => candidate === word && !taken.has(index));
    taken.add(at);
    return at;
  });
};

// Свой namespace layoutId для каждой фразы: слова новой фразы не прилетают из старой
let itemSeq = 0;

export const OrderStage: FC<OrderStageProps> = (props) => {
  const {
    item, answer, checked, onPick, onUnpick, onCheck,
  } = props;
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const complete = answer.length === item.bank.length;
  // Новая фраза — новый объект item
  const layoutGroupId = useMemo(() => {
    itemSeq += 1;
    return `order-${item.card.uuid}-${itemSeq}`;
  }, [item]);

  // Ячейка банка, из которой взято каждое слово ответа: оттуда слово и перелетает (FLIP)
  const [slots, setSlots] = useState<Slots>({ item, bankIndexes: [] });
  const answerBankIndexes = useMemo(() => {
    const own = slots.item === item ? slots.bankIndexes : [];
    const inSync = own.length === answer.length && own.every((at, i) => item.bank[at] === answer[i]);
    return inSync ? own : deriveBankIndexes(item.bank, answer);
  }, [slots, item, answer]);
  const usedBankIndexes = useMemo(() => new Set(answerBankIndexes), [answerBankIndexes]);

  const pick = (bankIndex: number) => {
    setSlots({ item, bankIndexes: [...answerBankIndexes, bankIndex] });
    // Редьюсер ждёт индекс среди невыбранных слов — подойдёт любое вхождение того же слова
    onPick(remainingBank(item, answer).indexOf(item.bank[bankIndex]));
  };

  const unpick = (index: number) => {
    setSlots({ item, bankIndexes: answerBankIndexes.filter((_, i) => i !== index) });
    onUnpick(index);
  };

  const chipMotion = (bankIndex: number) => ({
    layoutId: `w-${bankIndex}`,
    transition: FLIP_TRANSITION,
    // Reduced motion: без перелёта, слово проявляется на новом месте
    ...(reducedMotion && {
      layout: false as const,
      layoutId: undefined,
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: FADE_TRANSITION,
    }),
  });

  // Снимаем слова с конца: индексы впереди стоящих не сдвигаются
  const resetAnswer = () => {
    for (let i = answer.length - 1; i >= 0; i -= 1) onUnpick(i);
    setSlots({ item, bankIndexes: [] });
  };

  useKeyDown((e) => {
    if (e.key === 'Enter' && complete) onCheck();
  }, { enabled: !checked });

  return (
    <LayoutGroup id={layoutGroupId}>
      <div className={cls.prompt}>
        <Kicker className={cls.kicker}>{t('Соберите фразу')}</Kicker>
        <span className={cls.phrase}>{item.card.translation}</span>
      </div>

      {/* Строка ответа: клик по слову возвращает его в банк. */}
      <div className={cls.answerRow}>
        {answer.map((word, index) => (
          // Ключ — ячейка банка: слово может повторяться в фразе
          <motion.span key={answerBankIndexes[index]} className={cls.slot} {...chipMotion(answerBankIndexes[index])}>
            <Blueprint
              as="button"
              className={classNames(cls.chip, [cls.picked])}
              onClick={checked ? undefined : () => unpick(index)}
            >
              {word}
            </Blueprint>
          </motion.span>
        ))}
        {!checked && <span className={cls.caret} />}
      </div>

      {!checked && (
        <>
          <div className={cls.bank}>
            {item.bank.map((word, index) => (usedBankIndexes.has(index) ? (
              // Место взятого слова — пунктир
              <Blueprint
                as="button"
                key={`used-${index}`}
                className={classNames(cls.chip, [cls.used])}
                aria-disabled
              >
                {word}
              </Blueprint>
            ) : (
              <motion.span key={`free-${index}`} className={cls.slot} {...chipMotion(index)}>
                <Blueprint as="button" className={cls.chip} onClick={() => pick(index)}>
                  {word}
                </Blueprint>
              </motion.span>
            )))}
          </div>

          <div className={cls.actions}>
            <SessionButton
              variant={SessionButtonVariant.SECONDARY}
              size={SessionButtonSize.MD}
              className={cls.action}
              disabled={answer.length === 0}
              onClick={resetAnswer}
            >
              {t('Сбросить')}
            </SessionButton>
            <SessionButton
              size={SessionButtonSize.MD}
              className={classNames(cls.action, [cls.check])}
              disabled={!complete}
              onClick={onCheck}
            >
              {t('Проверить')}
            </SessionButton>
          </div>
        </>
      )}
    </LayoutGroup>
  );
};
