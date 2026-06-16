import { FC, ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography, Alert } from 'antd';
import { ReloadOutlined, BugOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { classNames } from '@/shared/lib/classNames/classNames';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import cls from './ErrorPage.module.scss';

interface ErrorPageProps {
    className?: string;
    error?: Error;
    errorInfo?: ErrorInfo;
    errorId?: string;
    category?: 'chunk' | 'network' | 'runtime' | 'unknown';
    recoverable?: boolean;
    onReload?: () => void;
}

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

    const defaultReloadPage = () => {
         
        location.reload();
    };

    const handleReload = onReload || defaultReloadPage;

    /**
     * Get error-specific messages and icons
     */
    const getErrorContent = () => {
        switch (category) {
            case 'chunk':
                return {
                    icon: <ReloadOutlined style={{ fontSize: '48px', color: 'var(--color-warning)' }} />,
                    title: t('Компонент временно недоступен'),
                    description: t('Произошла ошибка при загрузке компонента. Это может быть связано с обновлением приложения.'),
                    severity: 'warning' as const,
                };
            case 'network':
                return {
                    icon: <InfoCircleOutlined style={{ fontSize: '48px', color: 'var(--color-accent-blue)' }} />,
                    title: t('Проблема с подключением'),
                    description: t('Не удается установить соединение с сервером. Проверьте подключение к интернету.'),
                    severity: 'info' as const,
                };
            case 'runtime':
                return {
                    icon: <BugOutlined style={{ fontSize: '48px', color: 'var(--color-error)' }} />,
                    title: t('Критическая ошибка приложения'),
                    description: t('Произошла критическая ошибка в работе приложения.'),
                    severity: 'error' as const,
                };
            default:
                return {
                    icon: <BugOutlined style={{ fontSize: '48px', color: 'var(--color-link)' }} />,
                    title: t('Произошла непредвиденная ошибка'),
                    description: t('Приложение столкнулось с неожиданной проблемой.'),
                    severity: 'error' as const,
                };
        }
    };

    const { icon, title, description, severity: _severity } = getErrorContent();

    return (
        <div className={classNames(cls.ErrorPage, {}, [className])}>
            <VStack gap="24" align="center" max>
                {/* Error Icon */}
                {icon}

                {/* Error Title */}
                <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>
                    {title}
                </Typography.Title>

                {/* Error Description */}
                <MyTypography.Base style={{ textAlign: 'center', maxWidth: '600px' }}>
                    {description}
                </MyTypography.Base>

                {/* Error ID for tracking */}
                {errorId && (
                    <Alert
                        type="info"
                        showIcon={false}
                        className={cls.errorIdAlert}
                        message={
                            <MyTypography.Small>
                                {t('ID ошибки')}: <code>{errorId}</code>
                            </MyTypography.Small>
                        }
                    />
                )}

                {/* Development Error Details */}
                {__IS_DEV__ && error && (
                    <Alert
                        type="warning"
                        showIcon
                        className={cls.devAlert}
                        title={<span className={cls.alertTitle}>{t('Детали ошибки (только для разработки)')}</span>}
                        description={
                            <VStack gap="8">
                                <MyTypography.Small>
                                    <strong>{t('Сообщение')}:</strong> {error.message}
                                </MyTypography.Small>
                                {error.stack && (
                                    <details className={cls.stackDetails}>
                                        <summary>
                                            <MyTypography.Small>
                                                {t('Трассировка стека')}
                                            </MyTypography.Small>
                                        </summary>
                                        <pre className={cls.stackTrace}>
                                            {error.stack}
                                        </pre>
                                    </details>
                                )}
                                {errorInfo?.componentStack && (
                                    <details className={cls.stackDetails}>
                                        <summary>
                                            <MyTypography.Small>
                                                {t('Стек компонентов')}
                                            </MyTypography.Small>
                                        </summary>
                                        <pre className={cls.stackTrace}>
                                            {errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </VStack>
                        }
                    />
                )}

                <Button
                    type={recoverable ? 'default' : 'primary'}
                    size="large"
                    icon={<ReloadOutlined />}
                    onClick={handleReload}
                >
                    {t('Обновить страницу')}
                </Button>

                {/* User Guidance */}
                <MyTypography.Small style={{ textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '500px' }}>
                    {t('Если проблема повторяется, попробуйте очистить кэш браузера или обратитесь к системному администратору.')}
                </MyTypography.Small>
            </VStack>
        </div>
    );
};
