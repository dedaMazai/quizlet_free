import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { RoutePath } from '@/shared/config/router/routePath';
import { MyTypography } from '@/shared/ui/MyTypography';
import { VStack } from '@/shared/ui/Stack';

import cls from './PublicFooter.module.scss';

export const PublicFooter = memo(() => {
    const { t } = useTranslation();

    return (
        <footer className={cls.PublicFooter}>
            <VStack max gap="12" align="center" className={cls.inner}>
                <nav className={cls.nav} aria-label={t('Навигация')}>
                    <NavLink to={RoutePath.ABOUT()} className={cls.link}>
                        {t('О сервисе')}
                    </NavLink>
                    <NavLink to={RoutePath.FEATURES()} className={cls.link}>
                        {t('Возможности')}
                    </NavLink>
                    <NavLink to={RoutePath.FAQ()} className={cls.link}>
                        {t('Вопросы и ответы')}
                    </NavLink>
                    <NavLink to={RoutePath.PRIVACY()} className={cls.link}>
                        {t('Соглашение и конфиденциальность')}
                    </NavLink>
                </nav>
                <MyTypography.Small type="secondary">
                    {t('English Flashcards — учите английский фразами и не забывайте выученное')}
                </MyTypography.Small>
            </VStack>
        </footer>
    );
});
