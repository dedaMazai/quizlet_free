import { FC, ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import {
    Bug, CloudOff, LucideIcon, RotateCw,
} from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Blueprint, BlueprintMarks } from '@/shared/ui/Blueprint';
import cls from './ErrorPage.module.scss';

const ICON_SIZE = 32;
const ICON_STROKE = 1.25;
const BUTTON_ICON_SIZE = 16;
const BUTTON_ICON_STROKE = 1.5;

interface ErrorPageProps {
    className?: string;
    error?: Error;
    errorInfo?: ErrorInfo;
    errorId?: string;
    category?: 'chunk' | 'network' | 'runtime' | 'unknown';
    recoverable?: boolean;
    onReload?: () => void;
}

interface ErrorContent {
    icon: LucideIcon;
    title: string;
    description: string;
}

/** Экран падения приложения — в стиле ErrorScreen (6.33), без роутера и стора: они могли и упасть */
export const ErrorPage: FC<ErrorPageProps> = (props) => {
    const {
        className,
        error,
        errorInfo,
        errorId,
        category = 'unknown',
        recoverable = false,
        onReload,
    } = props;

    const { t } = useTranslation();

    const handleReload = onReload || (() => window.location.reload());

    const getErrorContent = (): ErrorContent => {
        switch (category) {
            case 'chunk':
                return {
                    icon: RotateCw,
                    title: t('Компонент временно недоступен'),
                    description: t('Произошла ошибка при загрузке компонента. Это может быть связано с обновлением приложения.'),
                };
            case 'network':
                return {
                    icon: CloudOff,
                    title: t('Проблема с подключением'),
                    description: t('Не удается установить соединение с сервером. Проверьте подключение к интернету.'),
                };
            case 'runtime':
                return {
                    icon: Bug,
                    title: t('Критическая ошибка приложения'),
                    description: t('Произошла критическая ошибка в работе приложения.'),
                };
            default:
                return {
                    icon: Bug,
                    title: t('Произошла непредвиденная ошибка'),
                    description: t('Приложение столкнулось с неожиданной проблемой.'),
                };
        }
    };

    const { icon: Icon, title, description } = getErrorContent();

    return (
        <div className={classNames(cls.ErrorPage, {}, [className])}>
            <Blueprint className={cls.iconBox}>
                <Icon aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
            </Blueprint>
            <h1 className={cls.title}>{title}</h1>
            <p className={cls.description}>{description}</p>

            {errorId && (
                <span className={cls.errorId}>
                    {t('ID ошибки')}
                    {': '}
                    <code>{errorId}</code>
                </span>
            )}

            {__IS_DEV__ && error && (
                <div className={cls.devDetails}>
                    <span className={cls.devTitle}>{t('Детали ошибки (только для разработки)')}</span>
                    <span>
                        <strong>{t('Сообщение')}:</strong>
                        {' '}
                        {error.message}
                    </span>
                    {error.stack && (
                        <details className={cls.stackDetails}>
                            <summary>{t('Трассировка стека')}</summary>
                            <pre className={cls.stackTrace}>{error.stack}</pre>
                        </details>
                    )}
                    {errorInfo?.componentStack && (
                        <details className={cls.stackDetails}>
                            <summary>{t('Стек компонентов')}</summary>
                            <pre className={cls.stackTrace}>{errorInfo.componentStack}</pre>
                        </details>
                    )}
                </div>
            )}

            <Button
                type={recoverable ? 'default' : 'primary'}
                className={cls.button}
                icon={<RotateCw aria-hidden size={BUTTON_ICON_SIZE} strokeWidth={BUTTON_ICON_STROKE} />}
                onClick={handleReload}
            >
                {!recoverable && <BlueprintMarks />}
                {t('Обновить страницу')}
            </Button>

            <p className={cls.hint}>
                {t('Если проблема повторяется, попробуйте очистить кэш браузера или обратитесь к системному администратору.')}
            </p>
        </div>
    );
};
