import { memo } from 'react';
import {
    Button,
    Tooltip,
} from 'antd';
import {
    MoonOutlined,
    SunOutlined,
} from '@ant-design/icons';
import { useTheme } from '@/shared/lib/hooks/useTheme';
import { Theme } from '@/shared/const/theme';
import { useTranslation } from 'react-i18next';

import cls from './ThemeSwitcher.module.scss';

export const ThemeSwitcher = memo(() => {
    const { theme, toggleTheme, isLoading } = useTheme();
    const { t } = useTranslation();

    return (
        <Tooltip title={t('Сменить тему')} placement="bottomLeft">
            <Button
                className={cls.ThemeSwitcher}
                onClick={() => toggleTheme()}
                loading={isLoading}
                icon={theme === Theme.LIGHT ? <MoonOutlined /> : <SunOutlined />}
                color="default"
                variant="filled"
            />
        </Tooltip>
    );
})
