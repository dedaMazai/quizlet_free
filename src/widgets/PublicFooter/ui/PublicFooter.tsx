import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { RoutePath } from '@/shared/config/router/routePath';

import cls from './PublicFooter.module.scss';

/** Подвал публичной страницы: макета нет (Public 6.34), только ссылка на соглашение в токенах */
export const PublicFooter = memo(() => {
    const { t } = useTranslation();

    return (
        <footer className={cls.PublicFooter}>
            <span>
                {t('Zubrika — учите английский фразами и не забывайте выученное')}
            </span>
            <Link to={RoutePath.PRIVACY()} className={cls.link}>
                {t('Соглашение и конфиденциальность')}
            </Link>
        </footer>
    );
});

PublicFooter.displayName = 'PublicFooter';
