import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from 'antd';
import { ChevronRight, Settings } from 'lucide-react';
import { RoutePath } from '@/shared/config/router/routePath';
import { ThemeMode } from '@/shared/const/theme';
import { useTheme } from '@/shared/lib/hooks/useTheme';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import cls from './QuickSettingsButton.module.scss';

const ICON_SIZE = 20;
const CHEVRON_SIZE = 16;
const ICON_STROKE = 1.5;
const MODAL_WIDTH = 420;

enum InterfaceLang {
    RU = 'ru',
    EN = 'en',
}

/** Шестерёнка в шапке мобильных разделов: тема и язык в шторке снизу */
export const QuickSettingsButton = memo(() => {
    const { t, i18n } = useTranslation();
    const { mode, setMode } = useTheme();
    const [open, setOpen] = useState(false);

    const lang = i18n.language === InterfaceLang.EN ? InterfaceLang.EN : InterfaceLang.RU;

    const openSheet = useCallback(() => setOpen(true), []);
    const closeSheet = useCallback(() => setOpen(false), []);
    const changeLang = useCallback((value: InterfaceLang) => i18n.changeLanguage(value), [i18n]);

    return (
        <>
            <Button
                type="text"
                aria-label={t('Настройки')}
                icon={<Settings aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                onClick={openSheet}
            />
            <ModalFrame open={open} width={MODAL_WIDTH} title={t('Настройки')} onClose={closeSheet}>
                <div className={cls.body}>
                    <div className={cls.field}>
                        <span className={cls.label}>{t('Тема')}</span>
                        <BoxSegmented<ThemeMode>
                            block
                            value={mode}
                            onChange={setMode}
                            options={[
                                { label: t('Светлая'), value: ThemeMode.LIGHT },
                                { label: t('Тёмная'), value: ThemeMode.DARK },
                                { label: t('Авто'), value: ThemeMode.SYSTEM },
                            ]}
                        />
                    </div>
                    <div className={cls.field}>
                        <span className={cls.label}>{t('Язык')}</span>
                        <BoxSegmented<InterfaceLang>
                            block
                            value={lang}
                            onChange={changeLang}
                            // Названия языков — на самом языке, не переводятся
                            options={[
                                { label: 'Русский', value: InterfaceLang.RU },
                                { label: 'English', value: InterfaceLang.EN },
                            ]}
                        />
                    </div>
                    <Link to={RoutePath.PROFILE()} className={cls.allSettings} onClick={closeSheet}>
                        {t('Все настройки')}
                        <ChevronRight aria-hidden size={CHEVRON_SIZE} strokeWidth={ICON_STROKE} />
                    </Link>
                </div>
            </ModalFrame>
        </>
    );
});

QuickSettingsButton.displayName = 'QuickSettingsButton';
