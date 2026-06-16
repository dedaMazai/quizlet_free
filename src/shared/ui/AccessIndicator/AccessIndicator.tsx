import { FC, memo } from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './AccessIndicator.module.scss';

export type AccessPermission = 'private' | 'read' | 'read_write';

interface AccessIndicatorProps {
    className?: string;
    permission: AccessPermission;
    showTooltip?: boolean;
    size?: 'small' | 'medium';
    tooltipTitle?: string;
}

const getPermissionTooltip = (
    permission: AccessPermission,
    t: (key: string) => string,
): string => {
    switch (permission) {
        case 'private':
            return t('Приватный доступ');
        case 'read':
            return t('Только просмотр');
        case 'read_write':
            return t('Просмотр и редактирование');
        default:
            return '';
    }
};

/**
 * AccessIndicator - цветовой индикатор уровня доступа
 * - Красная точка: приватный доступ (private)
 * - Синяя точка: только просмотр (read)
 * - Без индикатора: полный доступ (read_write)
 */
export const AccessIndicator: FC<AccessIndicatorProps> = memo((props) => {
    const { className, permission, showTooltip = true, size = 'small', tooltipTitle } = props;
    const { t } = useTranslation();

    // Не показываем индикатор для read_write (полный доступ)
    if (permission === 'read_write') {
        return null;
    }

    const indicator = (
        <span
            className={classNames(cls.AccessIndicator, [className, cls[size]], {
                [cls.private]: permission === 'private',
                [cls.read]: permission === 'read',
            })}
        />
    );

    if (showTooltip) {
        return (
            <Tooltip title={tooltipTitle || getPermissionTooltip(permission, t)} placement="top">
                {indicator}
            </Tooltip>
        );
    }

    return indicator;
});

AccessIndicator.displayName = 'AccessIndicator';
