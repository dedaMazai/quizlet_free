import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { memo, useMemo } from 'react';
import { Accesses } from '@/shared/types/accesses';
import { UserAccessValidator } from './UserAccessValidator';
import { ROLE_NAMES, RoleName } from '../model/types/user';

interface RoleSelectProps {
    placeholder?: string;
    value?: RoleName;
    disabled?: boolean;
    onChange?: (value: RoleName) => void;
    style?: React.CSSProperties;
    allowClear?: boolean;
}

/**
 * RoleSelect - компонент для выбора роли пользователя
 * @param placeholder - текст плейсхолдера
 * @param value - выбранное значение роли
 * @param disabled - флаг отключения компонента
 * @param onChange - обработчик изменения значения
 * @param style - дополнительные стили
 * @param allowClear - возможность очистки выбранного значения
 */
export const RoleSelectDefault = memo((props: RoleSelectProps) => {
    const {
        value,
        onChange,
        style,
        placeholder,
        disabled,
        allowClear,
    } = props;

    const { t } = useTranslation();

    const roleOptions = useMemo(() => 
        Object.entries(ROLE_NAMES).map(([key, name]) => ({
            value: key as RoleName,
            label: t(name),
        })),
    [t]);

    return (
        <Select
            value={value}
            onChange={onChange}
            style={style}
            placeholder={placeholder || t('Роль')}
            disabled={disabled}
            allowClear={allowClear}
            options={roleOptions}
        />
    );
});

export const RoleSelect = memo((props: RoleSelectProps) => {
    return (
        <UserAccessValidator
            accesses={[
                Accesses.users_can_read
            ]}
        >
            <RoleSelectDefault {...props} />
        </UserAccessValidator>
    )
})
