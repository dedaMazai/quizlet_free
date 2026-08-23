import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router';
import { Button } from 'antd';
import { ReactComponent as LogoFlashcards } from '@/shared/assets/icons/LogoFlashcards.svg';
import { useUserInfo } from '@/entities/User';
import { LangSwitcher } from '@/features/LangSwitcher';
import { ThemeSwitcher } from '@/features/ThemeSwitcher';
import { RoutePath } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { HStack } from '@/shared/ui/Stack';

import cls from './PublicHeader.module.scss';

const linkClass = ({ isActive }: { isActive: boolean }) => classNames(cls.link, { [cls.active]: isActive });

export const PublicHeader = memo(() => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userInfo = useUserInfo();

    const handleCtaClick = useCallback(() => {
        navigate(userInfo ? RoutePath.MAIN() : RoutePath.LOGIN());
    }, [navigate, userInfo]);

    return (
        <header className={cls.PublicHeader}>
            <div className={cls.inner}>
                <NavLink to={RoutePath.ABOUT()} className={cls.logo} aria-label={t('О сервисе')}>
                    <LogoFlashcards width={22} height={40} />
                </NavLink>

                <nav className={cls.nav} aria-label={t('Навигация')}>
                    <NavLink to={RoutePath.FEATURES()} className={linkClass}>
                        {t('Возможности')}
                    </NavLink>
                    <NavLink to={RoutePath.FAQ()} className={linkClass}>
                        {t('Вопросы и ответы')}
                    </NavLink>
                </nav>

                <HStack gap="8" align="center" className={cls.actions}>
                    <LangSwitcher />
                    <ThemeSwitcher />
                    <Button type="primary" size="large" onClick={handleCtaClick}>
                        {userInfo ? t('В приложение') : t('Войти')}
                    </Button>
                </HStack>
            </div>
        </header>
    );
});
