import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Empty, Switch } from 'antd';
import { MyTypography } from '@/shared/ui/MyTypography';
import { SessionButton } from '@/shared/ui/SessionButton';
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
      <Empty description={t('Ни у одного слова нет примера с этим словом')}>
        <MyTypography.Small type="secondary">
          {t('Добавьте примеры к словам — их умеет подбирать проверка через ИИ')}
        </MyTypography.Small>
      </Empty>
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
