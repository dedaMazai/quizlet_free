import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from 'antd';
import { ArrowDown } from 'lucide-react';
import { AboutAnchor, getAboutAnchorPath } from '@/shared/config/router/routePath';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';

import { FlipCardDemo } from '../../demo/FlipCardDemo';
import cls from './HeroSection.module.scss';

const ARROW_SIZE = 16;

interface HeroSectionProps {
    ctaLabel: string;
    onStart: () => void;
}

/** Первый экран: обещание, CTA и живая карточка, которую можно перевернуть */
export const HeroSection = memo(({ ctaLabel, onStart }: HeroSectionProps) => {
    const { t } = useTranslation();

    const facts = [
        { key: 'free', value: t('Бесплатно'), label: t('все режимы и статистика') },
        { key: 'modes', value: t('5 режимов'), label: t('и расписание повторений') },
        { key: 'ai', value: t('ИИ'), label: t('проверит переводы и подберёт фразы') },
    ];

    return (
        <section className={cls.HeroSection}>
            <div className={cls.main}>
                <Kicker tone={KickerTone.ACCENT} className={cls.kicker}>{t('ГИБКОСТЬ QUIZLET · ПАМЯТЬ ANKI · КОНТЕКСТ И ИИ')}</Kicker>
                <h1 className={cls.title}>{t('Учите фразами. Не забывайте через месяц.')}</h1>
                <p className={cls.text}>
                    {t('Собираете колоду своих слов и фраз — Zubrika учит их в пяти режимах и сама решает, что повторить сегодня, чтобы слово не забылось.')}
                </p>
                <div className={cls.actions}>
                    <Button type="primary" className={cls.cta} onClick={onStart}>
                        <BlueprintMarks />
                        {ctaLabel}
                    </Button>
                    <Link to={getAboutAnchorPath(AboutAnchor.HOW)} className={cls.secondary}>
                        {t('Как это работает')}
                        <ArrowDown size={ARROW_SIZE} aria-hidden />
                    </Link>
                </div>
                <dl className={cls.facts}>
                    {facts.map((fact) => (
                        <div key={fact.key} className={cls.fact}>
                            <dt className={cls.factValue}>{fact.value}</dt>
                            <dd className={cls.factLabel}>{fact.label}</dd>
                        </div>
                    ))}
                </dl>
            </div>
            <div className={cls.demo}>
                <Kicker>{t('Попробуйте прямо здесь')}</Kicker>
                <FlipCardDemo />
            </div>
        </section>
    );
});

HeroSection.displayName = 'HeroSection';
