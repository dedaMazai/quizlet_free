import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import { Switch } from 'antd';
import { SessionButton } from '@/shared/ui/SessionButton';
import { EmptyState, EmptyStateAlign } from '@/shared/ui/EmptyState';
import cls from './ClozeSession.module.scss';

interface ClozeSetupProps {
  /** Сколько карточек колоды годятся для режима. */
  fitting: number;
  total: number;
  defaultTypoTolerance: boolean;
  onStart: (typoTolerance: boolean) => void;
}

export const ClozeSetup: FC<ClozeSetupProps> = (props) => {
  const {
    fitting, total, defaultTypoTolerance, onStart,
  } = props;
  const { t } = useTranslation();
  const [typoTolerance, setTypoTolerance] = useState(defaultTypoTolerance);

  // Режим строится на поле «Пример»: без него пропуск делать не из чего.
  if (fitting === 0) {
    return (
      <EmptyState icon={Inbox} kicker={t('Пропуски')} title={t('Ни у одного слова нет примера с этим словом')} description={t('Добавьте примеры к словам — их умеет подбирать проверка через ИИ')} align={EmptyStateAlign.CENTER} />
    );
  }

  return (
    <>
      <span className={cls.note}>
        {t('Подходит слов: {{fit}} из {{total}}', { fit: fitting, total })}
      </span>

      <label className={cls.switchRow}>
        <Switch checked={typoTolerance} onChange={setTypoTolerance} />
        {t('Засчитывать ответ с опечаткой')}
      </label>

      <SessionButton onClick={() => onStart(typoTolerance)}>
        {t('Начать')}
      </SessionButton>
    </>
  );
};
