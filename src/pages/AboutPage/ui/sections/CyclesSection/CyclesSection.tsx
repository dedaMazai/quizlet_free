import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ArrowRight, RotateCcw, Star } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';

import { LandingSection } from '../../LandingSection';
import { CYCLE_PORTION, CYCLE_WORDS } from '../../demo/demoData';
import cls from './CyclesSection.module.scss';

const ICON_SIZE = 14;
const LAST_DAY = Math.ceil(CYCLE_WORDS.length / CYCLE_PORTION);
/** С этого дня в демо стоит точка старта повтора: самые старые слова пропускаются */
const START_POINT_DAY = 3;
const START_POINT_INDEX = 2;
/** «Важное» слово повторяется и до точки старта */
const IMPORTANT_INDEX = 0;

enum WordStatus {
    TODAY = 'today',
    REVIEW = 'review',
    SKIP = 'skip',
    QUEUE = 'queue',
}

const statusOf = (index: number, day: number): WordStatus => {
    const todayStart = (day - 1) * CYCLE_PORTION;
    if (index >= todayStart + CYCLE_PORTION) return WordStatus.QUEUE;
    if (index >= todayStart) return WordStatus.TODAY;
    if (day >= START_POINT_DAY && index < START_POINT_INDEX && index !== IMPORTANT_INDEX) return WordStatus.SKIP;
    return WordStatus.REVIEW;
};

/** Циклы заучивания: слова по порядку, как в тетради; каждый день — новая порция и повтор прошлых */
export const CyclesSection = memo(() => {
    const { t } = useTranslation();
    const [day, setDay] = useState(1);
    const isLastDay = day >= LAST_DAY;

    const statusLabels: Record<WordStatus, string> = {
        [WordStatus.TODAY]: t('Сегодня'),
        [WordStatus.REVIEW]: t('В повторе'),
        [WordStatus.SKIP]: t('Пропуск'),
        [WordStatus.QUEUE]: t('В очереди'),
    };

    const inSession = CYCLE_WORDS.filter((_, i) => {
        const status = statusOf(i, day);
        return status === WordStatus.TODAY || status === WordStatus.REVIEW;
    }).length;

    const points = [
        t('Записываете слова по порядку — как в бумажной тетради.'),
        t('Каждый день открывается новая порция, а все прошлые слова уходят в повтор.'),
        t('Сессия — полный проход EN → RU, затем RU → EN. Ошибки повторяются в конце прохода.'),
        t('Старые слова можно отсечь точкой старта, а важные отметить — они останутся в повторе.'),
    ];

    return (
        <LandingSection
            index={6}
            kicker={t('Циклы заучивания')}
            title={t('Для тех, кто любит учить по тетради')}
            lead={t('Отдельный формат для последовательного заучивания: порция новых слов в день плюс регулярный повтор всего пройденного.')}
        >
            <div className={cls.layout}>
                <ul className={cls.points}>
                    {points.map((point, i) => (
                        <li key={point} className={cls.point}>
                            <span className={cls.pointIndex}>{String(i + 1).padStart(2, '0')}</span>
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>

                <div className={cls.notebook}>
                    <div className={cls.head}>
                        <span className={cls.day}>{t('День {{day}}', { day })}</span>
                        <Kicker size={KickerSize.SM}>
                            {t('{{count}} слов в сессии', { count: inSession })}
                        </Kicker>
                    </div>
                    <ol className={cls.words} aria-live="polite">
                        {CYCLE_WORDS.map((word, i) => {
                            const status = statusOf(i, day);
                            return (
                                <li key={word} className={classNames(cls.word, [cls[status]])}>
                                    <span className={cls.wordIndex}>{i + 1}</span>
                                    <span className={cls.wordText}>
                                        {word}
                                        {i === IMPORTANT_INDEX && (
                                            <Star size={ICON_SIZE} className={cls.important} aria-label={t('Важное')} />
                                        )}
                                    </span>
                                    <span className={cls.status}>{statusLabels[status]}</span>
                                </li>
                            );
                        })}
                    </ol>
                    {isLastDay ? (
                        <Button icon={<RotateCcw size={ICON_SIZE} />} onClick={() => setDay(1)} className={cls.action}>
                            {t('Начать заново')}
                        </Button>
                    ) : (
                        <Button type="primary" onClick={() => setDay((prev) => prev + 1)} className={cls.action}>
                            {t('Новый день')}
                            <ArrowRight size={ICON_SIZE} aria-hidden />
                        </Button>
                    )}
                </div>
            </div>
        </LandingSection>
    );
});

CyclesSection.displayName = 'CyclesSection';
