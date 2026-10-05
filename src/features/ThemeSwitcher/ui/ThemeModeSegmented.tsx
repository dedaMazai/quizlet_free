import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeMode } from '@/shared/const/theme';
import { useTheme } from '@/shared/lib/hooks/useTheme';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';

/** Тема сегментами: Светлая · Тёмная · Как в системе (Настройки 6.25) */
export const ThemeModeSegmented = memo(() => {
    const { t } = useTranslation();
    const { mode, setMode } = useTheme();

    return (
        <BoxSegmented<ThemeMode>
            value={mode}
            onChange={setMode}
            options={[
                { label: t('Светлая'), value: ThemeMode.LIGHT },
                { label: t('Тёмная'), value: ThemeMode.DARK },
                { label: t('Как в системе'), value: ThemeMode.SYSTEM },
            ]}
        />
    );
});

ThemeModeSegmented.displayName = 'ThemeModeSegmented';
