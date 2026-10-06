import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Command, Copy, Download, Keyboard, LucideIcon, MonitorSmartphone, SunMoon, Star, Users, Volume2, WifiOff,
} from 'lucide-react';

import { LandingSection } from '../../LandingSection';
import cls from './DetailsSection.module.scss';

const ICON_SIZE = 22;
const ICON_STROKE = 1.5;

interface Detail {
    key: string;
    Icon: LucideIcon;
    title: string;
    text: string;
}

/** Мелочи, которые экономят время: сетка коротких фактов */
export const DetailsSection = memo(() => {
    const { t } = useTranslation();

    const details: Detail[] = [
        {
            key: 'palette',
            Icon: Command,
            title: t('Палитра команд ⌘K'),
            text: t('Повторить, создать колоду, добавить слова или перейти куда угодно — с клавиатуры.'),
        },
        {
            key: 'keyboard',
            Icon: Keyboard,
            title: t('Всё без мыши'),
            text: t('Цифры 1–4, стрелки и Enter в каждом режиме. Подсказки клавиш — прямо на кнопках.'),
        },
        {
            key: 'voice',
            Icon: Volume2,
            title: t('Озвучка'),
            text: t('Слово и фраза произносятся в любом режиме. Можно выбрать голос: американский, британский или австралийский.'),
        },
        {
            key: 'share',
            Icon: Users,
            title: t('Колоды для двоих и класса'),
            text: t('Поделитесь колодой по email и решите, можно ли её править. Прогресс у каждого свой.'),
        },
        {
            key: 'export',
            Icon: Download,
            title: t('Ваши слова — ваши'),
            text: t('Выгрузка в Excel, JSON или Markdown. Файл Excel можно загрузить обратно.'),
        },
        {
            key: 'duplicates',
            Icon: Copy,
            title: t('Поиск дублей'),
            text: t('Найдёт повторяющиеся слова в колоде или во всей библиотеке.'),
        },
        {
            key: 'favorites',
            Icon: Star,
            title: t('Избранное'),
            text: t('Отметьте звёздочкой трудные слова из разных колод — и учите их отдельной сессией.'),
        },
        {
            key: 'theme',
            Icon: SunMoon,
            title: t('Светлая и тёмная тема'),
            text: t('Или «как в системе» — для занятий перед сном.'),
        },
        {
            key: 'mobile',
            Icon: MonitorSmartphone,
            title: t('С телефона и компьютера'),
            text: t('Отдельная мобильная вёрстка с нижней панелью: удобно повторять в дороге.'),
        },
        {
            key: 'offline',
            Icon: WifiOff,
            title: t('Ответы не теряются'),
            text: t('Пропала сеть посреди заучивания — ответы сохранятся и отправятся, когда связь вернётся.'),
        },
    ];

    return (
        <LandingSection
            index={8}
            kicker={t('Детали')}
            title={t('Мелочи, которые экономят время каждый день')}
        >
            <ul className={cls.grid}>
                {details.map(({
                    key, Icon, title, text,
                }) => (
                    <li key={key} className={cls.item}>
                        <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} className={cls.icon} aria-hidden />
                        <span className={cls.title}>{title}</span>
                        <span className={cls.text}>{text}</span>
                    </li>
                ))}
            </ul>
        </LandingSection>
    );
});

DetailsSection.displayName = 'DetailsSection';
