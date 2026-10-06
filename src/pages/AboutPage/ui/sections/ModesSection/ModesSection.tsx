import {
    KeyboardEvent, memo, ReactNode, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
    Layers, LayoutGrid, Lightbulb, LucideIcon, PenLine, Sparkles,
} from 'lucide-react';
import { AboutAnchor } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { KeyHint } from '@/shared/ui/KeyHint';

import { LandingSection } from '../../LandingSection';
import { FlipCardDemo } from '../../demo/FlipCardDemo';
import {
    ClozeDemo, LearnDemo, OrderDemo, WriteDemo,
} from '../../demo/ModeDemos';
import cls from './ModesSection.module.scss';

const ICON_SIZE = 20;
const ICON_STROKE = 1.5;

enum Mode {
    FLASHCARDS = 'flashcards',
    LEARN = 'learn',
    WRITE = 'write',
    CLOZE = 'cloze',
    ORDER = 'order',
}

interface ModeInfo {
    key: Mode;
    Icon: LucideIcon;
    title: string;
    summary: string;
    why: string;
    keys: string[];
    demo: ReactNode;
}

/** Витрина режимов: вкладка слева, живое демо выбранного режима справа */
export const ModesSection = memo(() => {
    const { t } = useTranslation();
    const [active, setActive] = useState(Mode.FLASHCARDS);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const modes: ModeInfo[] = [
        {
            key: Mode.FLASHCARDS,
            Icon: LayoutGrid,
            title: t('Карточки'),
            summary: t('Первое знакомство со словами'),
            why: t('Переворот, озвучка и пример на лицевой стороне. Прогресс здесь не пишется — это разминка перед заучиванием.'),
            keys: [t('ПРОБЕЛ — перевернуть'), t('← → — листать')],
            demo: <FlipCardDemo />,
        },
        {
            key: Mode.LEARN,
            Icon: Lightbulb,
            title: t('Заучивание'),
            summary: t('Раунды по 7 слов: выбор, затем ввод'),
            why: t('Новое слово сначала узнаёте из 4 вариантов, потом пишете по памяти. Ошибка — и слово вернётся в этой же сессии.'),
            keys: [t('1–4 — ответ'), t('ENTER — подтвердить')],
            demo: <LearnDemo />,
        },
        {
            key: Mode.WRITE,
            Icon: PenLine,
            title: t('Письмо'),
            summary: t('Перевод в обе стороны'),
            why: t('Пишете перевод с русского или на русский. Одна опечатка засчитывается как «почти» — интервал вырастет, но меньше.'),
            keys: [t('ENTER — проверить')],
            demo: <WriteDemo />,
        },
        {
            key: Mode.CLOZE,
            Icon: Sparkles,
            title: t('Пропуски'),
            summary: t('Слово внутри своего примера'),
            why: t('Самый сильный формат для памяти: вспоминаете слово в живом контексте. Формы -s, -ed, -ing принимаются.'),
            keys: [t('ENTER — проверить')],
            demo: <ClozeDemo />,
        },
        {
            key: Mode.ORDER,
            Icon: Layers,
            title: t('Собери фразу'),
            summary: t('Порядок слов на чанках'),
            why: t('Собираете фразу из кусочков. Готовые сочетания снимают нагрузку при разговоре — речь становится беглее.'),
            keys: [],
            demo: <OrderDemo />,
        },
    ];

    const current = modes.find((mode) => mode.key === active) ?? modes[0];

    // Стрелки переключают вкладки — паттерн WAI-ARIA tabs
    const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
        let next = index;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (index + 1) % modes.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (index - 1 + modes.length) % modes.length;
        else return;
        e.preventDefault();
        setActive(modes[next].key);
        tabRefs.current[next]?.focus();
    };

    return (
        <LandingSection
            id={AboutAnchor.FEATURES}
            index={2}
            kicker={t('Режимы')}
            title={t('Пять режимов — от «впервые вижу» до «говорю не задумываясь»')}
            lead={t('Каждый режим тренирует свой навык памяти. Попробуйте любой прямо здесь — это те же механики, что в приложении.')}
        >
            <div className={cls.layout}>
                <div role="tablist" aria-orientation="vertical" aria-label={t('Режимы')} className={cls.tabs}>
                    {modes.map((mode, i) => {
                        const isActive = mode.key === active;
                        return (
                            <button
                                key={mode.key}
                                ref={(el) => { tabRefs.current[i] = el; }}
                                type="button"
                                role="tab"
                                id={`mode-tab-${mode.key}`}
                                aria-selected={isActive}
                                aria-controls="mode-panel"
                                tabIndex={isActive ? 0 : -1}
                                className={classNames(cls.tab, { [cls.tabActive]: isActive })}
                                onClick={() => setActive(mode.key)}
                                onKeyDown={(e) => handleTabKeyDown(e, i)}
                            >
                                <span className={cls.tabIndex}>{String(i + 1).padStart(2, '0')}</span>
                                <mode.Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} className={cls.tabIcon} aria-hidden />
                                <span className={cls.tabText}>
                                    <span className={cls.tabTitle}>{mode.title}</span>
                                    <span className={cls.tabSummary}>{mode.summary}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div
                    role="tabpanel"
                    id="mode-panel"
                    aria-labelledby={`mode-tab-${current.key}`}
                    className={cls.panel}
                >
                    {/* key — сброс состояния демо при смене режима */}
                    <div key={current.key} className={cls.stage}>
                        {current.demo}
                    </div>
                    <div className={cls.caption}>
                        <p className={cls.why}>{current.why}</p>
                        {current.keys.length > 0 && (
                            <div className={cls.keys}>
                                {current.keys.map((key) => <KeyHint key={key}>{key}</KeyHint>)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LandingSection>
    );
});

ModesSection.displayName = 'ModesSection';
