import { useTranslation } from 'react-i18next';
import { ErrorScreen } from '@/widgets/ErrorScreen';

const FORBIDDEN_CODE = '403';

const ForbiddenPage = () => {
    const { t } = useTranslation();

    return (
        <ErrorScreen
            code={FORBIDDEN_CODE}
            title={t('Нет доступа')}
            description={t('У вас нет доступа к этой странице.')}
        />
    );
};

export default ForbiddenPage;
