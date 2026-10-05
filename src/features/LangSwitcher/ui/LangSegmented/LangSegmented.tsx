import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BoxSegmented } from '@/shared/ui/BoxSegmented';

enum InterfaceLang {
    RU = 'ru',
    EN = 'en',
}

/** Язык интерфейса сегментами: Русский · English (Настройки 6.25) */
export const LangSegmented = memo(() => {
    const { i18n } = useTranslation();
    const value = i18n.language === InterfaceLang.EN ? InterfaceLang.EN : InterfaceLang.RU;

    return (
        <BoxSegmented<InterfaceLang>
            value={value}
            onChange={(lang) => i18n.changeLanguage(lang)}
            // Названия языков — на самом языке, не переводятся
            options={[
                { label: 'Русский', value: InterfaceLang.RU },
                { label: 'English', value: InterfaceLang.EN },
            ]}
        />
    );
});

LangSegmented.displayName = 'LangSegmented';
