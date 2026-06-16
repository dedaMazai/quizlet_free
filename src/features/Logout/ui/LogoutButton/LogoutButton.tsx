import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { useLogoutMutation } from '@/entities/User';
import { CustomButton } from '@/shared/ui/CustomButton';
import { MyTypography } from '@/shared/ui/MyTypography';

type LogoutButtonVariant = 'navbar' | 'sidebar';

interface LogoutButtonProps {
    className?: string;
    variant?: LogoutButtonVariant;
    collapsed?: boolean;
    icon?: ReactNode;
}

/**
 * LogoutButton - кнопка выхода из системы
 * @param variant - вариант отображения: 'navbar' для мобильного меню, 'sidebar' для бокового меню
 * @param collapsed - свёрнут ли sidebar (только для variant='sidebar')
 * @param icon - иконка для кнопки (только для variant='sidebar')
 */
export const LogoutButton: FC<LogoutButtonProps> = (props) => {
    const {
        className,
        variant = 'navbar',
        collapsed = false,
        icon,
    } = props;
    const { t } = useTranslation();
    const [logout] = useLogoutMutation();

    const handleLogout = () => {
        logout();
    };

    if (variant === 'sidebar') {
        return (
            <CustomButton
                className={className}
                block
                variant="reject"
                size="large"
                style={{ display: 'flex', alignItems: 'center' }}
                onClick={handleLogout}
            >
                {icon}
                {!collapsed && (
                    <MyTypography.Base style={{ color: 'inherit' }}>
                        {t('Выйти')}
                    </MyTypography.Base>
                )}
            </CustomButton>
        );
    }

    // variant === 'navbar'
    return (
        <Button
            className={className}
            block
            color="danger"
            variant="outlined"
            style={{
                flexShrink: 0,
            }}
            size="large"
            onClick={handleLogout}
        >
            {t('Выйти из профиля')}
        </Button>
    );
};
