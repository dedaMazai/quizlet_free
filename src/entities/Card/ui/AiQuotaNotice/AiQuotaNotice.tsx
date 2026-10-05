import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useAiQuota } from '../../model/hooks/useAiQuota';
import cls from './AiQuotaNotice.module.scss';

const ICON_SIZE = 18;
const ICON_STROKE = 1.5;

interface AiQuotaNoticeProps {
  className?: string;
}

/** Плашка «срочно» рядом с ИИ-кнопками, когда осталось ≤3 запросов */
export const AiQuotaNotice = memo(({ className }: AiQuotaNoticeProps) => {
  const { t } = useTranslation();
  const { remaining, isLow } = useAiQuota();

  if (!isLow) return null;

  return (
    <div role="status" className={classNames(cls.AiQuotaNotice, [className])}>
      <Sparkles aria-hidden className={cls.icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      {t('ИИ-запросов на сегодня: {{count}}', { count: remaining })}
    </div>
  );
});

AiQuotaNotice.displayName = 'AiQuotaNotice';
