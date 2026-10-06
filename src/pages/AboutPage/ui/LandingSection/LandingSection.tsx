import { memo, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';

import cls from './LandingSection.module.scss';

export enum LandingSectionTone {
    PLAIN = 'plain',
    /** Полоса на --color-surface — чередуется с plain, чтобы отделить блоки */
    SURFACE = 'surface',
}

interface LandingSectionProps {
    id?: string;
    tone?: LandingSectionTone;
    /** Номер секции «02» в кикере */
    index: number;
    kicker: string;
    title: ReactNode;
    lead?: ReactNode;
    className?: string;
    children: ReactNode;
}

const formatIndex = (index: number) => String(index).padStart(2, '0');

/** Секция лендинга: кикер с номером, заголовок, лид и содержимое */
export const LandingSection = memo((props: LandingSectionProps) => {
    const {
        id, tone = LandingSectionTone.PLAIN, index, kicker, title, lead, className, children,
    } = props;

    return (
        <section id={id} className={classNames(cls.LandingSection, [className, cls[tone]])}>
            <div className={cls.intro}>
                <Kicker tone={KickerTone.ACCENT} className={cls.kicker}>{`${formatIndex(index)} · ${kicker}`}</Kicker>
                <h2 className={cls.title}>{title}</h2>
                {lead && <p className={cls.lead}>{lead}</p>}
            </div>
            {children}
        </section>
    );
});

LandingSection.displayName = 'LandingSection';
