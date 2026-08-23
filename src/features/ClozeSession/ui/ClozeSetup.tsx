import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Switch } from 'antd';
import { MyTypography } from '@/shared/ui/MyTypography';
import { HStack, VStack } from '@/shared/ui/Stack';

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
    <VStack max gap="24" align="center">
      <MyTypography.Base type="secondary">
        {t('Подходит слов: {{fit}} из {{total}}', { fit: fitting, total })}
      </MyTypography.Base>

      <HStack gap="8" align="center">
        <Switch checked={typoTolerance} onChange={setTypoTolerance} />
        <MyTypography.Base>{t('Засчитывать ответ с опечаткой')}</MyTypography.Base>
      </HStack>

      <Button type="primary" size="large" onClick={() => onStart(typoTolerance)}>
        {t('Начать')}
      </Button>
    </VStack>
  );
};
