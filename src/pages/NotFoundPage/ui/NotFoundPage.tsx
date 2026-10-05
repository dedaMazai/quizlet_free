import { useTranslation } from 'react-i18next';
import { ErrorScreen } from '@/widgets/ErrorScreen';

const NOT_FOUND_CODE = '404';

export const NotFoundPage = () => {
    const { t } = useTranslation();

    return (
        <ErrorScreen
            code={NOT_FOUND_CODE}
            title={t('Такой страницы нет')}
            description={t('Возможно, колоду удалили или ссылка устарела.')}
        />
    );
};
