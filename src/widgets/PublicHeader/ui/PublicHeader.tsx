import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button } from 'antd';
import { ReactComponent as Logo } from '@/shared/assets/icons/LogoZubrika.svg';
import { useUserInfo } from '@/entities/User';
import { LangSwitcher } from '@/features/LangSwitcher';
import { ThemeSwitcher } from '@/features/ThemeSwitcher';
import {
    AboutAnchor, getAboutAnchorPath, getRegisterPath, RoutePath,
} from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { BlueprintMarks } from '@/shared/ui/Blueprint';

import cls from './PublicHeader.module.scss';

/** Название продукта не переводится. */
const APP_NAME = 'Zubrika';

/** Шапка публичной страницы «О сервисе» (Public 6.34): логотип, якоря секций, вход */
export const PublicHeader = memo(() => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userInfo = useUserInfo();

    const goToLogin = useCallback(() => navigate(RoutePath.LOGIN()), [navigate]);
    const goToRegister = useCallback(() => navigate(getRegisterPath()), [navigate]);
    const goToApp = useCallback(() => navigate(RoutePath.MAIN()), [navigate]);

    return (
        <header className={cls.PublicHeader}>
            <Link to={RoutePath.ABOUT()} className={cls.logo}>
                <Logo className={cls.logoIcon} />
                <span className={cls.logoText}>{APP_NAME}</span>
            </Link>

            <nav className={cls.nav} aria-label={t('Навигация')}>
                <Link to={getAboutAnchorPath(AboutAnchor.HOW)} className={cls.link}>
                    {t('Как это работает')}
                </Link>
                <Link to={getAboutAnchorPath(AboutAnchor.FEATURES)} className={cls.link}>
                    {t('Режимы')}
                </Link>
                <Link to={getAboutAnchorPath(AboutAnchor.AI)} className={cls.link}>
                    {t('ИИ')}
                </Link>
                <Link to={getAboutAnchorPath(AboutAnchor.COMPARE)} className={cls.link}>
                    {t('Сравнение')}
                </Link>
                <Link to={getAboutAnchorPath(AboutAnchor.FAQ)} className={cls.link}>
                    {t('Вопросы')}
                </Link>
            </nav>

            <div className={cls.actions}>
                <LangSwitcher />
                <ThemeSwitcher />
                {userInfo ? (
                    <Button type="primary" className={cls.button} onClick={goToApp}>
                        <BlueprintMarks />
                        {t('В приложение')}
                    </Button>
                ) : (
                    <>
                        <Button className={cls.button} onClick={goToLogin}>
                            {t('Войти')}
                        </Button>
                        <Button type="primary" className={classNames(cls.button, [cls.primary])} onClick={goToRegister}>
                            <BlueprintMarks />
                            {t('Начать бесплатно')}
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
});

PublicHeader.displayName = 'PublicHeader';
