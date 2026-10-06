import { CSSProperties, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox } from 'antd';
import { Gauge, Sparkles } from 'lucide-react';
import { AboutAnchor } from '@/shared/config/router/routePath';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Kicker, KickerSize, KickerTone } from '@/shared/ui/Kicker';
import { SpeakButton } from '@/shared/ui/SpeakButton';

import { LandingSection } from '../../LandingSection';
import { AI_CHECK_DEMO, AI_CHUNKS_DEMO, AI_PRACTICE_DEMO } from '../../demo/demoData';
import cls from './AiSection.module.scss';

const ICON_SIZE = 16;
const ICON_STROKE = 1.75;

/** ИИ: проверка переводов, подбор фраз, практика времён — на моковых ответах */
export const AiSection = memo(() => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<string[]>(AI_CHECK_DEMO.map((row) => row.term));
    const [applied, setApplied] = useState<string[]>([]);
    const [chunksShown, setChunksShown] = useState(false);

    const toggleRow = (term: string) => setSelected((prev) => (prev.includes(term)
        ? prev.filter((item) => item !== term)
        : [...prev, term]));

    const isApplied = applied.length > 0;

    return (
        <LandingSection
            id={AboutAnchor.AI}
            index={4}
            kicker={t('ИИ-помощник')}
            title={t('ИИ делает рутину, вы — учите')}
            lead={t('Проверит переводы, подберёт живые сочетания к словам и объяснит ошибку в грамматике. Вы решаете, что из предложенного принять.')}
        >
            <div className={cls.grid}>
                <article className={cls.card}>
                    <div className={cls.cardIntro}>
                        <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>{t('Проверка переводов')}</Kicker>
                        <h3 className={cls.cardTitle}>{t('Найдёт неточный перевод')}</h3>
                        <p className={cls.cardText}>
                            {t('ИИ просматривает колоду и отмечает переводы, которые стоит поправить. Вы видите, что было и что предлагается, и применяете нужное.')}
                        </p>
                    </div>
                    <div className={cls.cardBody}>
                        <div className={cls.diff}>
                            {AI_CHECK_DEMO.map((row) => {
                                const rowApplied = applied.includes(row.term);
                                return (
                                    <div key={row.term} className={cls.diffRow}>
                                        <Checkbox
                                            checked={selected.includes(row.term)}
                                            disabled={isApplied}
                                            onChange={() => toggleRow(row.term)}
                                            className={cls.diffTerm}
                                        >
                                            {row.term}
                                        </Checkbox>
                                        <div className={cls.diffCols}>
                                            <span className={cls.diffLabel}>{t('Сейчас')}</span>
                                            <span className={classNames(cls.diffValue, { [cls.diffOld]: rowApplied })}>
                                                {row.current}
                                            </span>
                                            <span className={cls.diffLabel}>{t('Предлагает ИИ')}</span>
                                            <span className={classNames(cls.diffValue, [cls.diffNew])}>{row.suggested}</span>
                                            <span className={cls.diffLabel}>{t('Пример')}</span>
                                            <span className={cls.diffExample}>{row.example}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Button
                            className={cls.cardAction}
                            disabled={selected.length === 0}
                            onClick={() => setApplied(isApplied ? [] : selected)}
                        >
                            {isApplied ? t('Вернуть как было') : t('Применить выбранные')}
                        </Button>
                    </div>
                </article>

                <article className={cls.card}>
                    <div className={cls.cardIntro}>
                        <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>{t('Подбор фраз')}</Kicker>
                        <h3 className={cls.cardTitle}>{t('Превратит слово в готовые фразы')}</h3>
                        <p className={cls.cardText}>
                            {t('Выберите до 10 слов — к каждому ИИ подберёт 2–3 частотных сочетания с примерами. Фразы сохраняются в колоду и связаны с исходным словом.')}
                        </p>
                    </div>
                    <div className={cls.cardBody}>
                        <div className={cls.chunks}>
                            <span className={cls.chunkWord}>{AI_CHUNKS_DEMO.word}</span>
                            {!chunksShown && (
                                <span className={cls.chunksPlaceholder}>
                                    {t('Нажмите «Подобрать фразы» — ИИ предложит частотные сочетания с этим словом')}
                                </span>
                            )}
                            {chunksShown && AI_CHUNKS_DEMO.chunks.map((chunk, i) => (
                                <div
                                    key={chunk.phrase}
                                    className={cls.chunk}
                                    // Порядковый номер задаёт задержку появления
                                    style={{ '--i': i } as CSSProperties}
                                >
                                    <div className={cls.chunkHead}>
                                        <span className={cls.chunkPhrase}>{chunk.phrase}</span>
                                        <SpeakButton text={chunk.phrase} />
                                    </div>
                                    <span className={cls.chunkTranslation}>{chunk.translation}</span>
                                    <span className={cls.chunkExample}>{chunk.example}</span>
                                </div>
                            ))}
                        </div>
                        <Button
                            type={chunksShown ? 'default' : 'primary'}
                            className={cls.cardAction}
                            icon={<Sparkles size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                            onClick={() => setChunksShown((prev) => !prev)}
                        >
                            {chunksShown ? t('Скрыть') : t('Подобрать фразы')}
                        </Button>
                    </div>
                </article>

                <article className={cls.card}>
                    <div className={cls.cardIntro}>
                        <Kicker size={KickerSize.SM} tone={KickerTone.ACCENT}>{t('Практика времён')}</Kicker>
                        <h3 className={cls.cardTitle}>{t('Объяснит, почему ответ неверный')}</h3>
                        <p className={cls.cardText}>
                            {t('ИИ составляет новые предложения на выбранные времена, проверяет ответы и даёт совет по каждой ошибке.')}
                        </p>
                    </div>
                    <div className={cls.cardBody}>
                        <div className={cls.practice}>
                            <span className={cls.sentence}>
                                {`${AI_PRACTICE_DEMO.before} `}
                                <span className={cls.wrongAnswer}>{AI_PRACTICE_DEMO.wrong}</span>
                                {' '}
                                <span className={cls.rightAnswer}>{AI_PRACTICE_DEMO.right}</span>
                                {` ${AI_PRACTICE_DEMO.after}`}
                                <span className={cls.verb}>{` (${AI_PRACTICE_DEMO.verb})`}</span>
                            </span>
                            <div className={cls.advice}>
                                <Kicker size={KickerSize.SM}>{t('Совет ИИ')}</Kicker>
                                <span>
                                    {t('«since» + точка во времени — признак Present Perfect: действие началось в прошлом и продолжается сейчас.')}
                                </span>
                            </div>
                        </div>
                    </div>
                </article>
            </div>

            <p className={cls.quota}>
                <Gauge size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />
                {t('У каждого аккаунта бесплатный дневной лимит запросов к ИИ — остаток виден рядом с ИИ-кнопками. Встроенные упражнения по грамматике работают и без ИИ.')}
            </p>
        </LandingSection>
    );
});

AiSection.displayName = 'AiSection';
