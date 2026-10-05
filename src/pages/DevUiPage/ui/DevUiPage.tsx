import { memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RoutePath } from '@/shared/config/router/routePath';
import { STREAK_LEVEL_THRESHOLDS } from '@/shared/lib/streak';
import { AccentPanel } from '@/shared/ui/AccentPanel';
import { Blueprint, BlueprintCorners } from '@/shared/ui/Blueprint';
import { DueBadge } from '@/shared/ui/DueBadge';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import { MasteryBar, MasteryBarSize } from '@/shared/ui/MasteryBar';
import { SectionHeader, SectionHeaderSize } from '@/shared/ui/SectionHeader';
import { SectionTabs, SectionTabItem } from '@/shared/ui/SectionTabs';
import { StatCell, StatCellTone } from '@/shared/ui/StatCell';
import { StreakFlame } from '@/shared/ui/StreakFlame';
import { TickProgress, TickProgressSize, TickState } from '@/shared/ui/TickProgress';
import cls from './DevUiPage.module.scss';

// Проверочная страница: подписи — имена компонентов и значения пропсов, не пользовательский текст

const SESSION_TICKS: TickState[] = [
    TickState.CORRECT, TickState.CORRECT, TickState.WRONG, TickState.CORRECT, TickState.CORRECT,
    TickState.CURRENT,
    ...Array.from({ length: 8 }, () => TickState.TODO),
];

const STEP_TICKS: TickState[] = [
    TickState.DONE, TickState.DONE, TickState.DONE,
    ...Array.from({ length: 4 }, () => TickState.TODO),
];

interface DemoProps {
    name: string;
    children: ReactNode;
}

const Demo = ({ name, children }: DemoProps) => (
    <section className={cls.demo}>
        <h2 className={cls.demoTitle}>{name}</h2>
        {children}
    </section>
);

interface CaseProps {
    caption: string;
    children: ReactNode;
}

const Case = ({ caption, children }: CaseProps) => (
    <div className={cls.case}>
        <code className={cls.caption}>{caption}</code>
        {children}
    </div>
);

const DevUiPage = () => {
    const { t } = useTranslation();

    const learnTabs: SectionTabItem[] = [
        {
            to: RoutePath.DEV_UI(), label: t('К повторению'), count: 42, countHighlighted: true,
        },
        { to: RoutePath.CYCLES(), label: t('Циклы заучивания') },
        { to: RoutePath.ROADMAP(), label: t('Дорожная карта') },
    ];

    const libraryTabs: SectionTabItem[] = [
        { to: RoutePath.DECKS(), label: t('Колоды'), count: 14 },
        { to: RoutePath.DEV_UI(), label: t('Все слова'), count: '1 240' },
        { to: RoutePath.FAVORITES(), label: t('Избранное'), count: 38 },
    ];

    return (
        <div className={cls.DevUiPage}>
            <h1 className={cls.title}>{RoutePath.DEV_UI()}</h1>

            <Demo name="Blueprint">
                <div className={cls.row}>
                    <Case caption="corners=default">
                        <Blueprint className={cls.box} />
                    </Case>
                    <Case caption="corners=light">
                        <AccentPanel className={cls.box}>
                            <Blueprint corners={BlueprintCorners.LIGHT} className={cls.lightBox} />
                        </AccentPanel>
                    </Case>
                </div>
            </Demo>

            <Demo name="AccentPanel">
                <AccentPanel className={cls.panel}>
                    <Kicker tone={KickerTone.ON_DARK}>{t('К повторению')}</Kicker>
                </AccentPanel>
            </Demo>

            <Demo name="Kicker">
                <div className={cls.row}>
                    <Case caption="size=md tone=default">
                        <Kicker>{t('Слова')}</Kicker>
                    </Case>
                    <Case caption="size=sm tone=default">
                        <Kicker size={KickerSize.SM}>{t('Слова')}</Kicker>
                    </Case>
                    <Case caption="size=sm tone=accent">
                        <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>{t('Слова')}</Kicker>
                    </Case>
                    <Case caption="tone=onDark">
                        <AccentPanel className={cls.panel}>
                            <Kicker tone={KickerTone.ON_DARK}>{t('Слова')}</Kicker>
                        </AccentPanel>
                    </Case>
                </div>
            </Demo>

            <Demo name="SectionHeader">
                <Case caption="size=sm">
                    <SectionHeader size={SectionHeaderSize.SM} title={t('Следующий шаг')} />
                </Case>
                <Case caption="size=md extra">
                    <SectionHeader
                        title={t('Следующий шаг')}
                        extra={<span className={cls.extra}>{t('Слов: {{count}}', { count: 44 })}</span>}
                    />
                </Case>
                <Case caption="size=lg">
                    <SectionHeader size={SectionHeaderSize.LG} title={t('Следующий шаг')} />
                </Case>
            </Demo>

            <Demo name="SectionTabs">
                <Case caption="countHighlighted">
                    <SectionTabs items={learnTabs} />
                </Case>
                <Case caption="count">
                    <SectionTabs items={libraryTabs} />
                </Case>
            </Demo>

            <Demo name="MasteryBar">
                <div className={cls.grid}>
                    <Case caption="size=md 62/21">
                        <MasteryBar mastered={62} learning={21} />
                    </Case>
                    <Case caption="size=md 12/30">
                        <MasteryBar mastered={12} learning={30} />
                    </Case>
                    <Case caption="size=sm 79/15">
                        <MasteryBar size={MasteryBarSize.SM} mastered={79} learning={15} />
                    </Case>
                    <Case caption="size=sm 80/12 (≥80%)">
                        <MasteryBar size={MasteryBarSize.SM} mastered={80} learning={12} />
                    </Case>
                </div>
            </Demo>

            <Demo name="TickProgress">
                <Case caption="size=md correct/wrong/current/todo">
                    <TickProgress ticks={SESSION_TICKS} />
                </Case>
                <Case caption="size=sm done/todo">
                    <TickProgress size={TickProgressSize.SM} ticks={STEP_TICKS} />
                </Case>
            </Demo>

            <Demo name="StatCell">
                <Blueprint className={cls.kpis}>
                    <StatCell label={t('Точность')} value="88" unit="%" delta="▲ 4%" tone={StatCellTone.SUCCESS} />
                    <StatCell label={t('Время')} value="26" unit={t('ч')} delta="7 / 26" />
                    <StatCell label={t('Текущая серия')} value="12" delta="12" tone={StatCellTone.STREAK_2} />
                    <StatCell label={t('Текущая серия')} value="31" delta="31" tone={StatCellTone.STREAK_4} />
                </Blueprint>
            </Demo>

            <Demo name="DueBadge">
                <div className={cls.row}>
                    <Case caption="count=12">
                        <DueBadge count={12} />
                    </Case>
                    <Case caption="count=14">
                        <DueBadge count={14} />
                    </Case>
                    <Case caption="count=15 (urgent)">
                        <DueBadge count={15} />
                    </Case>
                    <Case caption="count=21 (urgent)">
                        <DueBadge count={21} />
                    </Case>
                    <Case caption="count=0">
                        <DueBadge count={0} />
                    </Case>
                </div>
            </Demo>

            <Demo name="StreakFlame">
                <div className={cls.row}>
                    {STREAK_LEVEL_THRESHOLDS.map((days) => (
                        <Case key={days} caption={`days=${days}`}>
                            <StreakFlame days={days} />
                        </Case>
                    ))}
                </div>
            </Demo>
        </div>
    );
};

export default memo(DevUiPage);
