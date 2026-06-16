import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { Button, Tooltip } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { MyTypography } from '@/shared/ui/MyTypography';

interface LangSwitcherProps {
    size?: SizeType;
}

export const LangSwitcher = memo(({ size }: LangSwitcherProps) => {
    const { t, i18n } = useTranslation();

    const toggle = async () => {
        i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru');
    };

    return (
        <Tooltip title={t('Сменить язык')} placement="bottomLeft">
            <Button
                color="default"
                variant="filled"
                onClick={toggle}
                size={size}
                icon={(
                    <MyTypography.Small strong>
                        {i18n.language === 'ru' ? 'RU' : 'EN'}
                    </MyTypography.Small>
                )}
            />
        </Tooltip>
    );
});
