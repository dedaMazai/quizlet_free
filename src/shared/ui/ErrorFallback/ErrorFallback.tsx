import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { RotateCw } from 'lucide-react';
import cls from './ErrorFallback.module.scss';

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

export const ErrorFallback: FC = () => {
    const { t } = useTranslation();

    const handleReloadPage = () => {
        window.location.reload();
    };

    return (
        <div className={cls.ErrorFallback}>
            <p className={cls.text}>{t('Обновлен компонент! Необходимо обновить страницу')}</p>
            <Button
                icon={<RotateCw aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                onClick={handleReloadPage}
            >
                {t('Обновить страницу')}
            </Button>
        </div>
    );
};
