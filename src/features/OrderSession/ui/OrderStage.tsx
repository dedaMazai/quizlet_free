import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker } from '@/shared/ui/Kicker';
import { SessionButton, SessionButtonSize, SessionButtonVariant } from '@/shared/ui/SessionButton';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';
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

interface BankWord {
  word: string;
  /** Слово уже в строке ответа — на его месте пунктир */
  used: boolean;
  /** Индекс среди невыбранных слов — его ждёт PICK */
  remainingIndex: number;
}

/** Весь банк в исходном порядке с пометкой выбранных (с учётом повторов слов) */
const markBank = (bank: string[], answer: string[]): BankWord[] => {
  const used = [...answer];
  let remainingIndex = 0;
  return bank.map((word) => {
    const at = used.indexOf(word);
    if (at !== -1) {
      used.splice(at, 1);
      return { word, used: true, remainingIndex: -1 };
    }
    remainingIndex += 1;
    return { word, used: false, remainingIndex: remainingIndex - 1 };
  });
};

export const OrderStage: FC<OrderStageProps> = (props) => {
  const {
    item, answer, checked, onPick, onUnpick, onCheck,
  } = props;
  const { t } = useTranslation();
  const bank = useMemo(() => markBank(item.bank, answer), [item.bank, answer]);
  const complete = answer.length === item.bank.length;

  // Снимаем слова с конца: индексы впереди стоящих не сдвигаются
  const resetAnswer = () => {
    for (let i = answer.length - 1; i >= 0; i -= 1) onUnpick(i);
  };

  useKeyDown((e) => {
    if (e.key === 'Enter' && complete) onCheck();
  }, { enabled: !checked });

  return (
    <>
      <div className={cls.prompt}>
        <Kicker>{t('Соберите фразу')}</Kicker>
        <span className={cls.phrase}>{item.card.translation}</span>
      </div>

      {/* Строка ответа: клик по слову возвращает его в банк. */}
      <div className={cls.answerRow}>
        {answer.map((word, index) => (
          <Blueprint
            as="button"
            // Слово может повторяться в фразе, поэтому в ключе нужна позиция.
            key={`${word}-${index}`}
            className={classNames(cls.chip, [cls.picked])}
            onClick={checked ? undefined : () => onUnpick(index)}
          >
            {word}
          </Blueprint>
        ))}
        {!checked && <span className={cls.caret} />}
      </div>

      {!checked && (
        <>
          <div className={cls.bank}>
            {bank.map(({ word, used, remainingIndex }, index) => (
              <Blueprint
                as="button"
                key={`${word}-${index}`}
                className={classNames(cls.chip, { [cls.used]: used })}
                aria-disabled={used}
                onClick={used ? undefined : () => onPick(remainingIndex)}
              >
                {word}
              </Blueprint>
            ))}
          </div>

          <div className={cls.actions}>
            <SessionButton
              variant={SessionButtonVariant.SECONDARY}
              size={SessionButtonSize.MD}
              disabled={answer.length === 0}
              onClick={resetAnswer}
            >
              {t('Сбросить')}
            </SessionButton>
            <SessionButton size={SessionButtonSize.MD} disabled={!complete} onClick={onCheck}>
              {t('Проверить')}
            </SessionButton>
          </div>
        </>
      )}
    </>
  );
};
