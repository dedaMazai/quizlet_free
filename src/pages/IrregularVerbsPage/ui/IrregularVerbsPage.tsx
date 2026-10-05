import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, ButtonProps, Input } from 'antd';
import { Search } from 'lucide-react';
import { useGetMasteryQuery } from '@/entities/Statistics';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { RoutePath } from '@/shared/config/router/routePath';
import {
    IRREGULAR_VERBS, IrregularVerb, VerbBand, VERB_BANDS,
} from '@/shared/const/grammar';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { MasteryBar, MasteryBarSize } from '@/shared/ui/MasteryBar';
import { useImportVerbsDeck } from '../model/useImportVerbsDeck';

import cls from './IrregularVerbsPage.module.scss';

const SEARCH_ICON_SIZE = 15;
const MOBILE_SEARCH_ICON_SIZE = 16;
/** Сколько глаголов перечислить в подписи группы */
const PREVIEW_VERBS = 5;
const FIRST_BAND = 1;
/** Обозначения форм глагола — не переводятся */
const FORM_LABELS = ['V1', 'V2', 'V3'];

const toPercent = (part: number, total: number): number => (
    total > 0 ? Math.round((part / total) * 100) : 0
);

const IrregularVerbsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [openBands, setOpenBands] = useState<number[]>([FIRST_BAND]);
    const { importBand, importingBand, findExistingDeck } = useImportVerbsDeck();
    const { data: mastery } = useGetMasteryQuery();
    const { isMobile } = useMatchMedia();

    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = (verb: IrregularVerb): boolean => (
        !normalizedSearch
        || verb.base.toLowerCase().includes(normalizedSearch)
        || verb.past.toLowerCase().includes(normalizedSearch)
        || verb.participle.toLowerCase().includes(normalizedSearch)
        || verb.translation.toLowerCase().includes(normalizedSearch)
    );

    // Главная кнопка — у первой группы, для которой ещё нет колоды
    const nextBandIndex = VERB_BANDS.find((band) => !findExistingDeck(band))?.index;

    const toggleBand = (index: number) => {
        setOpenBands((prev) => (
            prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
        ));
    };

    /** Мобильная кнопка колоды: в подвале раскрытой группы — текстовая, у свёрнутой — компактная */
    const renderDeckAction = (band: VerbBand, className: string, isFooter: boolean) => {
        const deck = findExistingDeck(band);
        if (deck) {
            return (
                <Button type={isFooter ? 'text' : 'default'} className={className} onClick={() => navigate(RoutePath.DECK(deck.uuid))}>
                    {t('Открыть колоду')}
                </Button>
            );
        }

        // Залитая — у первой группы без колоды, как на десктопе
        let type: ButtonProps['type'] = band.index === nextBandIndex ? 'primary' : 'default';
        if (isFooter) type = 'text';

        return (
            <Button
                type={type}
                className={className}
                loading={importingBand === band.index}
                disabled={importingBand !== null && importingBand !== band.index}
                onClick={() => importBand(band)}
            >
                {isFooter
                    ? t('Создать колоду · {{count}}', { count: band.verbs.length })
                    : t('Создать · {{count}}', { count: band.verbs.length })}
            </Button>
        );
    };

    const getBandPercent = (band: VerbBand): number => {
        const deck = findExistingDeck(band);
        const deckMastery = deck && mastery?.perDeck.find((item) => item.deckKey === deck.uuid);
        return toPercent(deckMastery?.mastered ?? 0, deck?.cards_count ?? 0);
    };

    // Мобильная 6.54: раскрытая группа — таблица из 3 форм, свёрнутая — строка с кнопкой
    if (isMobile) {
        return (
            <div className={cls.IrregularVerbsPage}>
                <SectionPageHeader section={NavSectionKey.GRAMMAR} />

                <Input
                    className={cls.searchMobile}
                    prefix={<Search aria-hidden size={MOBILE_SEARCH_ICON_SIZE} strokeWidth={1.5} />}
                    allowClear
                    value={search}
                    placeholder={t('Форма или перевод')}
                    onChange={(event) => setSearch(event.target.value)}
                />

                {VERB_BANDS.map((band) => {
                    const visibleVerbs = band.verbs.filter(matchesSearch);
                    if (normalizedSearch && visibleVerbs.length === 0) return null;

                    const isOpen = Boolean(normalizedSearch) || openBands.includes(band.index);
                    const title = t('Группа {{index}} · {{from}}–{{to}}', {
                        index: band.index,
                        from: band.from,
                        to: band.to,
                    });

                    if (!isOpen) {
                        return (
                            <div key={band.index} className={cls.bandCollapsed}>
                                <button
                                    type="button"
                                    aria-expanded={false}
                                    className={cls.bandCollapsedToggle}
                                    onClick={() => toggleBand(band.index)}
                                >
                                    {title}
                                </button>
                                {renderDeckAction(band, cls.bandCollapsedCta, false)}
                            </div>
                        );
                    }

                    const percent = getBandPercent(band);

                    return (
                        <Blueprint key={band.index} className={cls.band}>
                            <button
                                type="button"
                                aria-expanded
                                className={cls.bandOpenHeader}
                                onClick={() => toggleBand(band.index)}
                            >
                                <span className={cls.bandOpenTitleRow}>
                                    <span className={cls.bandOpenTitle}>{title}</span>
                                    <span className={cls.bandPercent}>{`${percent}%`}</span>
                                </span>
                                <MasteryBar mastered={percent} learning={0} size={MasteryBarSize.SM} className={cls.bandBar} />
                            </button>
                            {visibleVerbs.map((verb) => (
                                <div key={verb.base} className={cls.rowMobile}>
                                    <span className={cls.base}>{verb.base}</span>
                                    <span>{verb.past}</span>
                                    <span>{verb.participle}</span>
                                    {/* Поиск ищет и по переводу — при поиске показываем его, иначе совпадение не видно */}
                                    {normalizedSearch && (
                                        <span className={cls.rowMobileTranslation}>{verb.translation}</span>
                                    )}
                                </div>
                            ))}
                            {renderDeckAction(band, cls.bandFooter, true)}
                        </Blueprint>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={cls.IrregularVerbsPage}>
            <SectionPageHeader section={NavSectionKey.GRAMMAR} />

            <div className={cls.toolbar}>
                <Input
                    className={cls.search}
                    prefix={<Search aria-hidden size={SEARCH_ICON_SIZE} strokeWidth={1.5} />}
                    allowClear
                    value={search}
                    placeholder={t('Форма глагола или перевод')}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <span className={cls.total}>
                    {t('{{count}} глаголов по частоте · {{bands}} группы', {
                        count: IRREGULAR_VERBS.length,
                        bands: VERB_BANDS.length,
                    })}
                </span>
            </div>

            <div className={cls.bands}>
                {VERB_BANDS.map((band) => {
                    const visibleVerbs = band.verbs.filter(matchesSearch);
                    if (normalizedSearch && visibleVerbs.length === 0) return null;

                    const deck = findExistingDeck(band);
                    const deckMastery = deck && mastery?.perDeck.find((item) => item.deckKey === deck.uuid);
                    const percent = toPercent(deckMastery?.mastered ?? 0, deck?.cards_count ?? 0);
                    // При поиске раскрываются все группы с совпадениями
                    const isOpen = Boolean(normalizedSearch) || openBands.includes(band.index);
                    const preview = band.verbs.slice(0, PREVIEW_VERBS).map((verb) => verb.base).join(', ');

                    return (
                        <Blueprint key={band.index} className={cls.band}>
                            <div className={cls.bandHeader}>
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    className={cls.bandToggle}
                                    onClick={() => toggleBand(band.index)}
                                >
                                    <span className={cls.bandTitle}>
                                        {t('Группа {{index}} · глаголы {{from}}–{{to}}', {
                                            index: band.index,
                                            from: band.from,
                                            to: band.to,
                                        })}
                                    </span>
                                    <span className={cls.bandSub}>
                                        {band.index === FIRST_BAND
                                            ? t('Самые частотные: {{verbs}}…', { verbs: preview })
                                            : `${preview}…`}
                                    </span>
                                </button>
                                <div className={cls.mastery}>
                                    <MasteryBar mastered={percent} learning={0} />
                                    <Kicker size={KickerSize.SM}>
                                        {t('{{percent}}% усвоено', { percent })}
                                    </Kicker>
                                </div>
                                {deck ? (
                                    <Button className={cls.cta} onClick={() => navigate(RoutePath.DECK(deck.uuid))}>
                                        {t('Открыть колоду')}
                                    </Button>
                                ) : (
                                    <Button
                                        type={band.index === nextBandIndex ? 'primary' : 'default'}
                                        className={cls.cta}
                                        loading={importingBand === band.index}
                                        disabled={importingBand !== null && importingBand !== band.index}
                                        onClick={() => importBand(band)}
                                    >
                                        {t('Создать колоду · {{count}}', { count: band.verbs.length })}
                                    </Button>
                                )}
                            </div>
                            {isOpen && (
                                <div className={cls.table}>
                                    <div className={classNames(cls.row, [cls.head])}>
                                        {FORM_LABELS.map((label) => <span key={label}>{label}</span>)}
                                        <span>{t('Перевод')}</span>
                                    </div>
                                    {visibleVerbs.map((verb) => (
                                        <div key={verb.base} className={cls.row}>
                                            <span className={cls.base}>{verb.base}</span>
                                            <span>{verb.past}</span>
                                            <span>{verb.participle}</span>
                                            <span className={cls.translation}>{verb.translation}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Blueprint>
                    );
                })}
            </div>
        </div>
    );
};

export default IrregularVerbsPage;
