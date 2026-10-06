import { CSSProperties, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ArrowRight, FileSpreadsheet, Languages, Sparkles } from 'lucide-react';
import { AboutAnchor, getAboutAnchorPath } from '@/shared/config/router/routePath';
import { IRREGULAR_VERBS } from '@/shared/const/grammar';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';

import { LandingSection, LandingSectionTone } from '../../LandingSection';
import { EDITOR_DEMO_ROWS, WEEK_LOAD } from '../../demo/demoData';
import cls from './HowItWorksSection.module.scss';

const ICON_SIZE = 14;
const ICON_STROKE = 1.75;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Средняя скорость повторения в приложении — для оценки минут */
const CARDS_PER_MINUTE = 3;

/** «Как это работает»: три шага от пустой колоды до повторений по расписанию */
export const HowItWorksSection = memo(() => {
    const { t, i18n } = useTranslation();

    const weekdays = useMemo(() => {
        const format = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' });
        const now = Date.now();
        return WEEK_LOAD.map((_, i) => format.format(new Date(now + i * DAY_MS)));
    }, [i18n.language]);

    const maxLoad = Math.max(...WEEK_LOAD);
    const today = WEEK_LOAD[0];

    const sources = [
        { key: 'excel', icon: <FileSpreadsheet size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: t('Импорт из Excel') },
        { key: 'ai', icon: <Sparkles size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: t('Фразы от ИИ') },
        {
            key: 'verbs',
            icon: <Languages size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
            label: t('{{count}} неправильных глаголов', { count: IRREGULAR_VERBS.length }),
        },
    ];

    const modes = [t('Карточки'), t('Заучивание'), t('Письмо'), t('Пропуски'), t('Собери фразу')];

    return (
        <LandingSection
            id={AboutAnchor.HOW}
            tone={LandingSectionTone.SURFACE}
            index={1}
            kicker={t('Как это работает')}
            title={t('Три шага — и слова начинают оставаться в голове')}
            lead={t('Не нужно ничего настраивать: создайте колоду, позанимайтесь 10 минут, а дальше приложение само подскажет, что и когда повторить.')}
        >
            <ol className={cls.steps}>
                <li className={cls.step}>
                    <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>{t('Шаг 1')}</Kicker>
                    <h3 className={cls.stepTitle}>{t('Соберите колоду')}</h3>
                    <p className={cls.stepText}>
                        {t('Вводите слова списком — перевод подставится сам. Или загрузите Excel, или возьмите готовый набор неправильных глаголов.')}
                    </p>
                    <div className={cls.visual} aria-hidden>
                        <div className={cls.editor}>
                            {EDITOR_DEMO_ROWS.map((row) => (
                                <div key={row.term} className={cls.editorRow}>
                                    <span className={cls.editorTerm}>{row.term}</span>
                                    <span className={cls.editorTranslation}>{row.translation}</span>
                                </div>
                            ))}
                            <span className={cls.autoTag}>{t('Автоперевод')}</span>
                        </div>
                        <div className={cls.sources}>
                            {sources.map((source) => (
                                <span key={source.key} className={cls.source}>
                                    {source.icon}
                                    {source.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </li>

                <li className={cls.step}>
                    <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>{t('Шаг 2')}</Kicker>
                    <h3 className={cls.stepTitle}>{t('Учите в режимах')}</h3>
                    <p className={cls.stepText}>
                        {t('От знакомства с карточкой до ввода по памяти и слова внутри фразы. Приложение подсказывает, с какого режима начать.')}
                    </p>
                    <div className={cls.visual}>
                        <ul className={cls.modes} aria-hidden>
                            {modes.map((mode, i) => (
                                <li key={mode} className={cls.mode}>
                                    <span className={cls.modeIndex}>{String(i + 1).padStart(2, '0')}</span>
                                    <span>{mode}</span>
                                    {i === 1 && <span className={cls.recommended}>{t('Рекомендуем')}</span>}
                                </li>
                            ))}
                        </ul>
                        <Link to={getAboutAnchorPath(AboutAnchor.FEATURES)} className={cls.more}>
                            {t('Попробовать режимы')}
                            <ArrowRight size={ICON_SIZE} aria-hidden />
                        </Link>
                    </div>
                </li>

                <li className={cls.step}>
                    <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>{t('Шаг 3')}</Kicker>
                    <h3 className={cls.stepTitle}>{t('Повторяйте по расписанию')}</h3>
                    <p className={cls.stepText}>
                        {t('Каждый день на главной ждёт очередь «К повторению» из всех колод. Слово возвращается ровно тогда, когда начинает забываться.')}
                    </p>
                    <div className={cls.visual} aria-hidden>
                        <div className={cls.due}>
                            <span className={cls.dueCount}>{today}</span>
                            <span className={cls.dueLabel}>
                                {t('к повторению сегодня · ~{{count}} мин', {
                                    count: Math.ceil(today / CARDS_PER_MINUTE),
                                })}
                            </span>
                        </div>
                        <div className={cls.chart}>
                            {WEEK_LOAD.map((load, i) => (
                                <div key={weekdays[i]} className={cls.bar}>
                                    <i
                                        className={cls.barFill}
                                        // Высота столбика — данные, а не оформление
                                        style={{ '--load': `${(load / maxLoad) * 100}%` } as CSSProperties}
                                    />
                                    <span className={cls.barLabel}>{weekdays[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </li>
            </ol>
        </LandingSection>
    );
});

HowItWorksSection.displayName = 'HowItWorksSection';
