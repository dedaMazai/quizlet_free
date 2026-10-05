import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { AccentPanel } from '@/shared/ui/AccentPanel';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './SelectionStrip.module.scss';

const ARROW_SIZE = 14;
const ICON_STROKE = 1.5;

interface SelectionStripProps {
  /** «418 слов» */
  title: string;
  /** «в фильтре · из 9 колод» */
  subtitle: string;
  /** «Заучивать выборку» */
  cta: string;
  disabled?: boolean;
  onCards: () => void;
  onLearn: () => void;
  className?: string;
}

/** Тёмная полоса выборки: запускает сессию по текущему фильтру (6.4–6.5) */
export const SelectionStrip = memo((props: SelectionStripProps) => {
  const {
    title, subtitle, cta, disabled, onCards, onLearn, className,
  } = props;
  const { t } = useTranslation();

  return (
    <AccentPanel className={classNames(cls.SelectionStrip, [className])}>
      <span className={cls.title}>{title}</span>
      <span className={cls.subtitle}>{subtitle}</span>
      <div className={cls.actions}>
        <button type="button" className={cls.secondary} disabled={disabled} onClick={onCards}>
          {t('Карточки')}
        </button>
        <button type="button" className={cls.primary} disabled={disabled} onClick={onLearn}>
          {cta}
          <ArrowRight aria-hidden size={ARROW_SIZE} strokeWidth={ICON_STROKE} />
        </button>
      </div>
    </AccentPanel>
  );
});

SelectionStrip.displayName = 'SelectionStrip';
