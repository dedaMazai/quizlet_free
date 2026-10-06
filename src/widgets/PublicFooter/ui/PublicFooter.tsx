import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { RoutePath } from '@/shared/config/router/routePath';
import { ReactComponent as TelegramIcon } from '@/shared/assets/icons/Telegram.svg';
import { OPERATOR } from '@/shared/const/legal';
import { TELEGRAM_APP_URL, TELEGRAM_BOT_USERNAME } from '@/shared/const/telegram';
import { classNames } from '@/shared/lib/classNames/classNames';

import cls from './PublicFooter.module.scss';

/** Подвал публичных страниц: слоган, документы и реквизиты оператора персональных данных */
export const PublicFooter = memo(() => {
    const { t } = useTranslation();

    return (
        <footer className={cls.PublicFooter}>
            <div className={cls.row}>
                <span>
                    {t('Zubrika — учите английский фразами и не забывайте выученное')}
                </span>
                <a href={TELEGRAM_APP_URL} target="_blank" rel="noopener noreferrer" className={classNames(cls.link, [cls.telegram])}>
                    <TelegramIcon className={cls.telegramIcon} aria-hidden />
                    {t('Telegram-бот')}
                    {` @${TELEGRAM_BOT_USERNAME}`}
                </a>
                {/* Открытые справочники — и для людей, и для обхода поисковиком */}
                <nav className={cls.links} aria-label={t('Грамматика')}>
                    <Link to={RoutePath.GRAMMAR_TENSES()} className={cls.link}>
                        {t('Времена')}
                    </Link>
                    <Link to={RoutePath.IRREGULAR_VERBS()} className={cls.link}>
                        {t('Неправильные глаголы')}
                    </Link>
                    <Link to={RoutePath.ROADMAP()} className={cls.link}>
                        {t('Дорожная карта')}
                    </Link>
                </nav>
                <nav className={cls.links} aria-label={t('Документы')}>
                    <Link to={RoutePath.TERMS()} className={cls.link}>
                        {t('Пользовательское соглашение')}
                    </Link>
                    <Link to={RoutePath.PRIVACY()} className={cls.link}>
                        {t('Политика конфиденциальности')}
                    </Link>
                    <Link to={RoutePath.PD_CONSENT()} className={cls.link}>
                        {t('Согласие на обработку данных')}
                    </Link>
                </nav>
            </div>
            <span className={cls.operator}>
                {`${OPERATOR.shortName} · ${t('ИНН')} ${OPERATOR.inn} · ${t('ОГРНИП')} ${OPERATOR.ogrnip} · `}
                <a href={`mailto:${OPERATOR.email}`} className={cls.link}>{OPERATOR.email}</a>
            </span>
        </footer>
    );
});

PublicFooter.displayName = 'PublicFooter';
