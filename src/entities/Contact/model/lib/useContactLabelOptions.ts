import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactLabel } from '../types/contact';

/** Подписи меток контакта для Select и для подсказки в выборе получателей */
export const useContactLabelOptions = () => {
    const { t } = useTranslation();

    return useMemo(() => [
        { value: ContactLabel.FRIEND, label: t('Друг') },
        { value: ContactLabel.STUDENT, label: t('Ученик') },
        { value: ContactLabel.TEACHER, label: t('Учитель') },
    ], [t]);
};
