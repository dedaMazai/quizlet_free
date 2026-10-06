import { CSSProperties, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, RotateCcw, X } from 'lucide-react';
import {
    applyReview, CardReview, gradeFromAnswer, MASTERED_INTERVAL,
} from '@/entities/Card';
import { AboutAnchor } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AnswerGrade } from '@/shared/lib/text';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';

import { LandingSection, LandingSectionTone } from '../../LandingSection';
import cls from './MemorySection.module.scss';

const ICON_SIZE = 14;
const ICON_STROKE = 2;
const DEMO_CARD_UUID = 'landing-demo';
const DEMO_TERM = 'reliable';
/** Сколько последних ответов показывать в ленте */
const HISTORY_LIMIT = 8;

interface HistoryItem {
    id: number;
    grade: AnswerGrade;
    interval: number;
}

const GRADE_CLASSES: Record<AnswerGrade, string> = {
    correct: cls.correct,
    almost: cls.almost,
    wrong: cls.wrong,
};

/** «Повторения без самооценки»: ответ сам двигает интервал — настоящий applyReview из приложения */
export const MemorySection = memo(() => {
    const { t } = useTranslation();
    const [review, setReview] = useState<CardReview | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const answer = (grade: AnswerGrade) => {
        const next = applyReview(review, DEMO_CARD_UUID, gradeFromAnswer(grade));
        setReview(next);
        setHistory((prev) => [
            ...prev,
            { id: prev.length, grade, interval: Math.round(next.interval_days) },
        ].slice(-HISTORY_LIMIT));
    };

    const reset = () => {
        setReview(null);
        setHistory([]);
    };

    const interval = review ? Math.round(review.interval_days) : null;
    const isMastered = review?.level === 2;

    let status = t('Новое');
    if (review) {
        if (review.level === 0) status = t('Повторить');
        else status = isMastered ? t('Усвоено') : t('Изучаю');
    }

    let nextShow = t('Карточка ещё не изучалась');
    if (interval === 0) nextShow = t('Вернётся в этой же сессии');
    else if (interval !== null) nextShow = t('Следующий показ через {{count}} дн.', { count: interval });

    const masteryShare = Math.min((review?.interval_days ?? 0) / MASTERED_INTERVAL, 1) * 100;

    const points = [
        {
            key: 'no-buttons',
            title: t('Без кнопок «легко / трудно»'),
            text: t('Оценка берётся из самого ответа: верно, с опечаткой или ошибка — интервал меняется по-разному.'),
        },
        {
            key: 'queue',
            title: t('Одна очередь на все колоды'),
            text: t('Просроченные карточки собираются в «К повторению». Видно, сколько займёт — и прогноз нагрузки на 2 недели.'),
        },
        {
            key: 'mastered',
            title: t('Усвоено — с 21 дня'),
            text: t('Интервал растёт с 1 дня до 3, дальше умножается на фактор лёгкости. Слово с интервалом от 21 дня — в долгой памяти.'),
        },
    ];

    return (
        <LandingSection
            id={AboutAnchor.MEMORY}
            tone={LandingSectionTone.SURFACE}
            index={3}
            kicker={t('Интервальные повторения')}
            title={t('Вы отвечаете — расписание подстраивается само')}
            lead={t('Отвечайте на карточку ниже и смотрите, как меняется дата следующего показа. Это тот же алгоритм, что работает в приложении.')}
        >
            <div className={cls.layout}>
                <div className={cls.demo}>
                    <div className={cls.cardHead}>
                        <span className={cls.term}>{DEMO_TERM}</span>
                        <span className={classNames(cls.status, { [cls.statusMastered]: isMastered })}>{status}</span>
                    </div>
                    <span className={cls.next} aria-live="polite">{nextShow}</span>

                    <div className={cls.meter}>
                        <div className={cls.meterTrack}>
                            <i
                                className={classNames(cls.meterFill, { [cls.meterDone]: isMastered })}
                                // Ширина — данные, а не оформление
                                style={{ '--share': `${masteryShare}%` } as CSSProperties}
                            />
                        </div>
                        <Kicker size={KickerSize.SM}>{t('до «Усвоено» — {{count}} дн.', { count: MASTERED_INTERVAL })}</Kicker>
                    </div>

                    <div className={cls.timeline}>
                        {history.length === 0 && <span className={cls.empty}>{t('Здесь появится история ответов')}</span>}
                        {history.map((item) => (
                            <span key={item.id} className={classNames(cls.step, [GRADE_CLASSES[item.grade]])}>
                                {item.grade === 'wrong'
                                    ? <X size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
                                    : <Check size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />}
                                {t('{{count}} дн.', { count: item.interval })}
                            </span>
                        ))}
                    </div>

                    <div className={cls.buttons}>
                        <button type="button" className={classNames(cls.answer, [cls.correct])} onClick={() => answer('correct')}>
                            {t('Ответил верно')}
                        </button>
                        <button type="button" className={classNames(cls.answer, [cls.almost])} onClick={() => answer('almost')}>
                            {t('С опечаткой')}
                        </button>
                        <button type="button" className={classNames(cls.answer, [cls.wrong])} onClick={() => answer('wrong')}>
                            {t('Ошибся')}
                        </button>
                        <button
                            type="button"
                            className={cls.reset}
                            onClick={reset}
                            disabled={!review}
                            aria-label={t('Сбросить')}
                        >
                            <RotateCcw size={ICON_SIZE} aria-hidden />
                        </button>
                    </div>
                </div>

                <ul className={cls.points}>
                    {points.map((point) => (
                        <li key={point.key} className={cls.point}>
                            <span className={cls.pointTitle}>{point.title}</span>
                            <span className={cls.pointText}>{point.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </LandingSection>
    );
});

MemorySection.displayName = 'MemorySection';
