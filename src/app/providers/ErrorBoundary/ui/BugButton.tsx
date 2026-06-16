import { Button } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Компонент для тестирования ErrorBoundary
export const BugButton = () => {
    const [error, setError] = useState(false);
    const { t } = useTranslation();

    const onThrowError = () => setError(true);

    // Ошибки в useEffect не всегда перехватываются ErrorBoundary
    // Лучше бросать ошибку прямо в render
    if (error) {
        throw new Error('Test Error - ErrorBoundary should catch this!');
    }

    return __IS_DEV__ ? (
        <Button onClick={onThrowError} danger type="dashed">
            {t('throw error', 'Test Error')}
        </Button>
    ) : null;
};
